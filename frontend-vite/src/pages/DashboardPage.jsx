import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Grid, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  CircularProgress,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Assignment as ProjectIcon,
  Assessment as ReportIcon,
  Timer as TimerIcon,
  Notifications as NotificationIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { fetchActivitySummary } from '../features/activity/activitySlice';
import { fetchTimesheetEntries } from '../features/timesheet/timesheetSlice';
import { fetchProjects } from '../features/projects/projectSlice';
import { format, subDays } from 'date-fns';
import { selectAuthLoading } from '../features/auth/authSlice.jsx';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" mb={2}>
        <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.contrastText`, mr: 2 }}>
          {icon}
        </Avatar>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const ActivityItem = ({ activity }) => {
  const theme = useTheme();
  
  return (
    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
      <ListItemIcon sx={{ minWidth: 40 }}>
        <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
          {activity.icon || <TimeIcon fontSize="small" />}
        </Avatar>
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="body1" component="span" sx={{ fontWeight: 'medium' }}>
            {activity.title}
          </Typography>
        }
        secondary={
          <React.Fragment>
            <Typography component="span" variant="body2" color="text.primary">
              {activity.description}
            </Typography>
            <Typography component="div" variant="caption" color="text.secondary">
              {activity.time}
            </Typography>
          </React.Fragment>
        }
      />
    </ListItem>
  );
};

const ProjectProgress = ({ project }) => {
  const progress = project.progress || 0;
  
  return (
    <Box mb={3}>
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography variant="body2" color="text.primary">
          {project.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {Math.round(progress)}%
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{ height: 8, borderRadius: 5 }} 
      />
    </Box>
  );
};

const DashboardPage = () => {
  console.log('Dashboard component rendered');
  const dispatch = useDispatch();
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const authLoading = useSelector(selectAuthLoading);
  const { summary, loading: activityLoading } = useSelector((state) => state.activity);
  const { entries, loading: timesheetLoading } = useSelector((state) => state.timesheet);
  const projects = useSelector((state) => state.projects.items || []);
  const projectsLoading = useSelector((state) => state.projects.loading);
  
  console.log('Auth state:', { user, authLoading });
  console.log('Activity state:', { summary, activityLoading });
  console.log('Timesheet state:', { entries, timesheetLoading });
  console.log('Projects state:', { projects, projectsLoading });
  
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager' || isAdmin;
  
  useEffect(() => {
    if (!user?.id) return;
    
    const today = new Date();
    const lastWeek = subDays(today, 7);
    const timestamp = new Date().getTime();
    
    // Fetch dashboard data with cache-busting
    dispatch(fetchActivitySummary({ 
      userId: user.id, 
      date: format(today, 'yyyy-MM-dd'),
      _t: timestamp
    }));
    
    dispatch(fetchTimesheetEntries({ 
      userId: user.id, 
      startDate: format(lastWeek, 'yyyy-MM-dd'),
      endDate: format(today, 'yyyy-MM-dd'),
      _t: timestamp
    }));
    
    if (isManager) {
      dispatch(fetchProjects({ 
        _t: timestamp,
        include_tasks: 'false',
        include_members: 'false'
      }));
    }
  }, [dispatch, user?.id, isManager]);
  
  // Show loading state
  if (authLoading || !user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="body1" ml={2}>Loading dashboard...</Typography>
      </Box>
    );
  }
  
  // Show loading state for data
  if (activityLoading || timesheetLoading || projectsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="body1" ml={2}>Loading dashboard data...</Typography>
      </Box>
    );
  }
  
  // Process data from the API responses with null checks
  const stats = [
    { 
      title: 'Hours Tracked', 
      value: (Array.isArray(entries) ? entries.reduce((total, entry) => {
        const hours = parseFloat(entry?.hours);
        return total + (isNaN(hours) ? 0 : hours);
      }, 0).toFixed(1) : 0) + 'h',
      icon: <TimeIcon />,
      color: 'primary'
    },
    { 
      title: 'Active Projects', 
      value: Array.isArray(projects) ? projects.length : 0,
      icon: <ProjectIcon />,
      color: 'success'
    },
    { 
      title: 'Tasks Completed', 
      value: Array.isArray(entries) ? 
        entries.filter(entry => String(entry?.description || '').toLowerCase().includes('completed')).length : 0,
      icon: <ProjectIcon />,
      color: 'info'
    },
    { 
      title: 'Daily Hours', 
      value: summary?.total_hours ? `${summary.total_hours}h` : '0h',
      icon: <ReportIcon />,
      color: 'warning'
    },
  ];
  
  // Create recent activities from timesheet entries with null checks
  const recentActivities = (Array.isArray(entries) ? entries.slice(0, 3) : []).map((entry, index) => {
    try {
      return {
        id: entry?.id || `entry-${index}`,
        title: entry?.project_name || 'Time Entry',
        description: String(entry?.description || 'No description provided'),
        time: entry?.date ? new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
        icon: <TimerIcon />
      };
    } catch (error) {
      console.error('Error processing activity:', error);
      return {
        id: `error-${index}`,
        title: 'Error loading activity',
        description: 'Could not load activity data',
        time: '--:--',
        icon: <ErrorIcon />
      };
    }
  });
  
  // Create project progress from projects or summary data with null checks
  const projectProgress = (Array.isArray(summary?.projects) ? summary.projects : []).map((project, index) => ({
    id: project?.id || `project-${index}`,
    name: String(project?.name || `Project ${index + 1}`),
    progress: Math.min(100, Math.max(0, (Number(project?.hours) || 0) / 10 * 100))
  }));
  
  // If no projects from summary, try to use projects from projects state
  if (projectProgress.length === 0 && Array.isArray(projects)) {
    projects.slice(0, 3).forEach((project, index) => {
      projectProgress.push({
        id: project?.id || `project-${index}`,
        name: String(project?.name || `Project ${index + 1}`),
        progress: Math.min(100, Math.max(0, (Number(project?.progress) || 0) * 100))
      });
    });
  }
  
  if (activityLoading || timesheetLoading || projectsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome back, {user?.name || 'User'}!
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Here's what's happening with your projects today.
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard 
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          </Grid>
        ))}
      </Grid>
      
      <Grid container spacing={3}>
        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" component="h2">
                Recent Activities
              </Typography>
              <Button size="small" color="primary">
                View All
              </Button>
            </Box>
            <List sx={{ width: '100%' }}>
              {recentActivities.map((activity) => (
                <React.Fragment key={activity.id}>
                  <ActivityItem activity={activity} />
                  {activity.id < recentActivities.length && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        
        {/* Project Progress */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" component="h2">
                Project Progress
              </Typography>
              <Button size="small" color="primary">
                View All
              </Button>
            </Box>
            {projectProgress.map((project) => (
              <ProjectProgress key={project.id} project={project} />
            ))}
          </Paper>
        </Grid>
        
        {/* Time Tracking */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" component="h2">
                Time Tracking
              </Typography>
              <Button variant="contained" color="primary" startIcon={<TimerIcon />}>
                Start Timer
              </Button>
            </Box>
            <Box textAlign="center" py={4}>
              <Typography variant="h2" component="div" color="primary" gutterBottom>
                00:00:00
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                No active time entry
              </Typography>
              <Button variant="outlined" color="primary" sx={{ mr: 2 }}>
                Add Time Manually
              </Button>
              <Button variant="contained" color="primary">
                Start Tracking
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
