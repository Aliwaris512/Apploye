import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserActivities } from '../features/activity/activitySlice';
import { 
  Box, Typography, Container, Paper, CircularProgress, Stack
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const activities = useSelector((state) => state.activity.userActivities);
  const loading = useSelector((state) => state.activity.loading);
  
  useEffect(() => {
    dispatch(getUserActivities());
  }, [dispatch]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Process data for the weekly chart
  const getWeeklyChartData = () => {
    const days = 7;
    const dailyTotals = {};
    
    // Initialize last 7 days with 0
    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), i), 'MMM dd');
      dailyTotals[date] = 0;
    }
    
    // Sum up activities by day
    activities.forEach(activity => {
      if (activity?.timestamp) {
        const date = format(new Date(activity.timestamp), 'MMM dd');
        if (dailyTotals[date] !== undefined) {
          dailyTotals[date] += activity.duration || 0;
        }
      }
    });
    
    // Convert to array and sort by date
    return Object.entries(dailyTotals)
      .map(([date, time]) => ({
        date,
        hours: Math.round((time / 3600) * 10) / 10, // Convert to hours with 1 decimal
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Get recent activities with null checks
  const recentActivities = [...activities]
    .filter(activity => activity?.timestamp)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name || 'User'}
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : activities.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>No activity data available.</Typography>
        </Paper>
      ) : (
        <>
          <Stack spacing={3} sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
          <Box sx={{ width: { xs: '100%', lg: '70%' } }}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Weekly Activity Overview</Typography>
              <Box sx={{ height: 300, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getWeeklyChartData()}>
                    <XAxis dataKey="date" />
                    <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      formatter={(value) => [`${value} hours`, 'Usage']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Bar 
                      dataKey="hours" 
                      name="Hours Tracked"
                      fill="#1976d2" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Box>
          
          <Box sx={{ width: { xs: '100%', lg: '30%' } }}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Recent Activities</Typography>
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, i) => (
                  <Box key={i} sx={{ 
                    mb: 2, 
                    p: 2, 
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      cursor: 'pointer'
                    }
                  }}>
                    <Typography variant="subtitle2" noWrap>{activity.appName || 'Unknown App'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatTime(activity.duration || 0)} • {activity.timestamp ? format(new Date(activity.timestamp), 'MMM d, h:mm a') : 'N/A'}
                    </Typography>
                    {activity.windowTitle && (
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {activity.windowTitle}
                      </Typography>
                    )}
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  No recent activities found
                </Typography>
              )}
            </Paper>
          </Box>
        </Stack>
      </Stack>
        </>
      )}
    </Container>
  );
};

export default Dashboard;
