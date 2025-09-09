import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  LinearProgress,
  Skeleton
} from '@mui/material';
import { 
  Timeline as TimelineIcon,
  PhotoLibrary as ScreenshotsIcon,
  Assessment as StatsIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Person as PersonIcon,
  Event as EventIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { useSnackbar } from 'notistack';

// Components
import ActivityTimeline from './components/ActivityTimeline';
import ScreenshotGallery from './components/ScreenshotGallery';
import ActivityStats from './components/ActivityStats';
import ProductivityMetrics from './components/ProductivityMetrics';
import ApplicationUsage from './components/ApplicationUsage';
import WebsiteUsage from './components/WebsiteUsage';

// Redux
import { 
  fetchActivities, 
  fetchScreenshots, 
  fetchActivityStats,
  selectAllActivities,
  selectAllScreenshots,
  selectActivityStats,
  selectMonitoringStatus,
  selectMonitoringError,
  clearMonitoringError
} from './monitoringSlice';

const MonitoringDashboard = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { enqueueSnackbar } = useSnackbar();
  
  // Redux state
  const activities = useSelector(selectAllActivities);
  const screenshots = useSelector(selectAllScreenshots);
  const stats = useSelector(selectActivityStats);
  const status = useSelector(selectMonitoringStatus);
  const error = useSelector(selectMonitoringError);
  
  // Local state
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 7),
    endDate: new Date(),
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle date range change
  const handleDateRangeChange = (field) => (newValue) => {
    setDateRange(prev => ({
      ...prev,
      [field]: newValue
    }));
  };
  
  // Handle filter menu
  const handleFilterMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setIsFilterMenuOpen(true);
  };
  
  const handleFilterMenuClose = () => {
    setIsFilterMenuOpen(false);
  };
  
  // Refresh data
  const refreshData = () => {
    const filters = {
      startDate: format(startOfDay(dateRange.startDate), 'yyyy-MM-dd'),
      endDate: format(endOfDay(dateRange.endDate), 'yyyy-MM-dd'),
    };
    
    if (selectedUser) {
      filters.userId = selectedUser.id;
    }
    
    dispatch(fetchActivities(filters));
    dispatch(fetchScreenshots(filters));
    dispatch(fetchActivityStats(filters));
  };
  
  // Initial data load
  useEffect(() => {
    refreshData();
  }, [dateRange, selectedUser]);
  
  // Show error message if there's an error
  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
      dispatch(clearMonitoringError());
    }
  }, [error, enqueueSnackbar, dispatch]);
  
  // Loading state
  if (status === 'loading' && !activities.length) {
    return (
      <Box p={3}>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Header */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Employee Monitoring
          </Typography>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <Chip 
              icon={<PersonIcon />} 
              label={selectedUser ? selectedUser.name : 'All Employees'} 
              variant="outlined" 
              size="small"
              onDelete={selectedUser ? () => setSelectedUser(null) : null}
            />
            <Chip 
              icon={<EventIcon />} 
              label={`${format(dateRange.startDate, 'MMM d')} - ${format(dateRange.endDate, 'MMM d, yyyy')}`} 
              variant="outlined" 
              size="small"
            />
          </Box>
        </Box>
        
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={handleFilterMenuOpen}
            size="small"
          >
            Filters
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshData}
            disabled={status === 'loading'}
            size="small"
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {/* Filter Menu */}
      <Menu
        anchorEl={anchorEl}
        open={isFilterMenuOpen}
        onClose={handleFilterMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box px={2} py={1}>
          <Typography variant="subtitle2" color="text.secondary">
            Date Range
          </Typography>
        </Box>
        <Box px={2} py={1} display="flex" flexDirection="column" gap={2} minWidth={250}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={dateRange.startDate}
              onChange={handleDateRangeChange('startDate')}
              renderInput={(params) => <TextField {...params} size="small" fullWidth />}
            />
            <DatePicker
              label="End Date"
              value={dateRange.endDate}
              onChange={handleDateRangeChange('endDate')}
              renderInput={(params) => <TextField {...params} size="small" fullWidth />}
            />
          </LocalizationProvider>
        </Box>
      </Menu>
      
      {/* Stats Overview */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TimeIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Total Active Time
                </Typography>
              </Box>
              <Typography variant="h5">
                {stats.totalActiveTime ? formatDuration(stats.totalActiveTime) : '--:--:--'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TimelineIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Activities Tracked
                </Typography>
              </Box>
              <Typography variant="h5">
                {stats.totalActivities || '0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <ScreenshotsIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Screenshots Captured
                </Typography>
              </Box>
              <Typography variant="h5">
                {stats.totalScreenshots || '0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Main Content */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTabs-flexContainer': {
              px: 2,
            },
          }}
        >
          <Tab label="Activity Timeline" icon={<TimelineIcon />} iconPosition="start" />
          <Tab label="Screenshots" icon={<ScreenshotsIcon />} iconPosition="start" />
          <Tab label="Productivity" icon={<StatsIcon />} iconPosition="start" />
          <Tab label="Applications" icon={<AppsIcon />} iconPosition="start" />
          <Tab label="Websites" icon={<PublicIcon />} iconPosition="start" />
        </Tabs>
        
        <Box p={3}>
          {activeTab === 0 && (
            <ActivityTimeline 
              activities={activities} 
              loading={status === 'loading'}
            />
          )}
          
          {activeTab === 1 && (
            <ScreenshotGallery 
              screenshots={screenshots} 
              loading={status === 'loading'}
            />
          )}
          
          {activeTab === 2 && (
            <ProductivityMetrics 
              data={stats.productivityMetrics} 
              loading={status === 'loading'}
            />
          )}
          
          {activeTab === 3 && (
            <ApplicationUsage 
              data={stats.applicationUsage} 
              loading={status === 'loading'}
            />
          )}
          
          {activeTab === 4 && (
            <WebsiteUsage 
              data={stats.websiteUsage} 
              loading={status === 'loading'}
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default MonitoringDashboard;
