import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  CircularProgress,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { getUserActivities, selectUserActivities, selectActivityLoading } from '../features/activity/activitySlice.jsx';

const Activity = () => {
  const dispatch = useDispatch();
  const activities = useSelector(selectUserActivities);
  const loading = useSelector(selectActivityLoading);
  const [period, setPeriod] = useState('today'); // 'today' | 'week'

  useEffect(() => {
    dispatch(getUserActivities(period));
  }, [dispatch, period]);
  
  const formatDuration = (ms) => {
    if (!ms && ms !== 0) return '0m';
    // Backend stores duration in seconds per activity entry
    const seconds = typeof ms === 'number' && ms > 10000 ? Math.floor(ms / 1000) : ms;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };
  
  if (loading && activities.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Activity
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={() => dispatch(getUserActivities(period))}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant={period === 'today' ? 'contained' : 'outlined'} size="small" onClick={() => setPeriod('today')}>Today</Button>
        <Button variant={period === 'week' ? 'contained' : 'outlined'} size="small" onClick={() => setPeriod('week')}>Last 7 days</Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 3, mb: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            {activities && activities.length > 0 ? (
              activities.map((activity, idx) => (
                <Box key={activity.id || idx} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                  <Typography variant="subtitle1">{activity.app || 'Unknown App'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDuration(activity.duration)}
                    {activity.timestamp ? ` • ${new Date(activity.timestamp).toLocaleString()}` : ''}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">No activities found.</Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ mb: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              {/* Simple computed summary */}
              <Typography>
                Total Entries: {activities?.length || 0}
              </Typography>
              <Typography>
                Total Time: {formatDuration((activities || []).reduce((acc, a) => acc + (a?.duration || 0), 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Activity;
