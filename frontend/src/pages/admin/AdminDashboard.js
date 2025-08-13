import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllActivities } from '../../features/activity/activitySlice';
import { 
  Box, Typography, Container, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, CircularProgress, Chip
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { activities, loading } = useSelector((state) => state.activity);
  const users = [...new Set(activities.map(activity => activity.user_id))];
  
  useEffect(() => {
    dispatch(getAllActivities());
  }, [dispatch]);

  // Process data for user activity chart
  const getUserActivityData = () => {
    const userActivity = {};
    
    activities.forEach(activity => {
      if (!userActivity[activity.user_id]) {
        userActivity[activity.user_id] = 0;
      }
      userActivity[activity.user_id] += activity.duration;
    });
    
    return Object.entries(userActivity).map(([userId, time]) => ({
      name: `User ${userId}`,
      time: time / 3600, // Convert to hours
    }));
  };

  // Process data for app usage chart
  const getAppUsageData = () => {
    const appUsage = {};
    
    activities.forEach(activity => {
      if (!appUsage[activity.app]) {
        appUsage[activity.app] = 0;
      }
      appUsage[activity.app] += activity.duration;
    });
    
    return Object.entries(appUsage).map(([app, time]) => ({
      name: app,
      value: Math.round((time / 3600) * 10) / 10, // Convert to hours with 1 decimal
    }));
  };

  // Get recent activities
  const recentActivities = [...activities]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
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
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>User Activity</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getUserActivityData()}>
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => [`${value} hours`, 'Usage']} />
                      <Bar dataKey="time" fill="#1976d2" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>App Usage Distribution</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getAppUsageData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => 
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {getAppUsageData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} hours`, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>Recent Activities</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User ID</TableCell>
                    <TableCell>Application</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentActivities.map((activity, index) => (
                    <TableRow key={index}>
                      <TableCell>User {activity.user_id}</TableCell>
                      <TableCell>{activity.app}</TableCell>
                      <TableCell>
                        <Chip 
                          label={`${Math.round(activity.duration / 60)}m`} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(activity.timestamp).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;
