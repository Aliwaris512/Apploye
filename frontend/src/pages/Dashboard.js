import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserActivities } from '../features/activity/activitySlice';
import { 
  Box, Typography, Container, Paper, Grid, CircularProgress, Card, CardContent 
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
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

  // Process data for the chart
  const getChartData = () => {
    const dailyTotals = {};
    
    activities.forEach(activity => {
      const date = format(new Date(activity.timestamp), 'MMM dd');
      if (!dailyTotals[date]) {
        dailyTotals[date] = 0;
      }
      dailyTotals[date] += activity.duration;
    });
    
    return Object.entries(dailyTotals).map(([date, time]) => ({
      date,
      time: time / 3600, // Convert to hours
    }));
  };

  // Get recent activities
  const recentActivities = [...activities]
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
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Activity Overview</Typography>
                <Box sx={{ height: 300, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getChartData()}>
                      <XAxis dataKey="date" />
                      <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => [`${value} hours`, 'Usage']} />
                      <Bar dataKey="time" fill="#1976d2" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Recent Activities</Typography>
                {recentActivities.map((activity, i) => (
                  <Box key={i} sx={{ mb: 2, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Typography variant="subtitle2">{activity.app}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatTime(activity.duration)} • {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default Dashboard;
