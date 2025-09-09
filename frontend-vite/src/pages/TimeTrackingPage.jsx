import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Timer as TimerIcon,
  List as ListIcon,
  BarChart as BarChartIcon,
  Today as TodayIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import Timer from '../features/timeTracking/Timer';
import TimeEntryForm from '../features/timeTracking/TimeEntryForm';
import TimeEntriesList from '../features/timeTracking/TimeEntriesList';
import { selectAllProjects, fetchProjects } from '../features/projects/projectSlice';
import { 
  fetchTimeEntries, 
  selectTimeTrackingStatus, 
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry
} from '../features/timeTracking/timeTrackingSlice';
import { useSnackbar } from 'notistack';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`time-tracking-tabpanel-${index}`}
      aria-labelledby={`time-tracking-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index) => {
  return {
    id: `time-tracking-tab-${index}`,
    'aria-controls': `time-tracking-tabpanel-${index}`,
  };
};

const TimeTrackingPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Redux state
  const projects = useSelector(selectAllProjects);
  const status = useSelector(selectTimeTrackingStatus);
  
  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  
  // Load initial data
  useEffect(() => {
    dispatch(fetchTimeEntries({ 
      limit: 10,
      sort: 'startTime:desc'
    }));
    // Ensure projects are available for timer project selection
    dispatch(fetchProjects({ _t: new Date().getTime(), include_tasks: 'false', include_members: 'false' }));
  }, [dispatch]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle entry form open/close
  const handleOpenEntryForm = (entry = null) => {
    setSelectedEntry(entry);
    setShowEntryForm(true);
  };
  
  const handleCloseEntryForm = () => {
    setShowEntryForm(false);
    setSelectedEntry(null);
  };
  
  // Handle form submission
  const handleSubmitEntry = async (entryData) => {
    try {
      if (selectedEntry) {
        await dispatch(updateTimeEntry({ id: selectedEntry.id, ...entryData })).unwrap();
        enqueueSnackbar('Time entry updated successfully', { variant: 'success' });
      } else {
        await dispatch(createTimeEntry(entryData)).unwrap();
        enqueueSnackbar('Time entry created successfully', { variant: 'success' });
      }
      handleCloseEntryForm();
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to save time entry', { variant: 'error' });
    }
  };
  
  // Handle entry deletion
  const handleDeleteEntry = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this time entry?')) {
      try {
        await dispatch(deleteTimeEntry(entryId)).unwrap();
        enqueueSnackbar('Time entry deleted successfully', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar(error.message || 'Failed to delete time entry', { variant: 'error' });
      }
    }
  };
  
  // Refresh data
  const handleRefresh = () => {
    dispatch(fetchTimeEntries({ 
      limit: 10,
      sort: 'startTime:desc'
    }));
  };

  // Show loading state
  if (status === 'loading' && projects.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems={isMobile ? 'flex-start' : 'center'} 
        flexDirection={isMobile ? 'column' : 'row'}
        mb={4}
        gap={2}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Time Tracking
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Track your time and manage your work hours
          </Typography>
        </Box>
        
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            size={isMobile ? 'small' : 'medium'}
          >
            {isMobile ? 'Filter' : 'Filter Entries'}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={status === 'loading'}
            size={isMobile ? 'small' : 'medium'}
          >
            {isMobile ? 'Refresh' : 'Refresh Data'}
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenEntryForm()}
            size={isMobile ? 'small' : 'medium'}
          >
            {isMobile ? 'Add' : 'Add Entry'}
          </Button>
        </Box>
      </Box>

      {/* Timer Component */}
      <Box mb={4}>
        <Timer />
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant={isMobile ? 'fullWidth' : 'standard'}
          aria-label="time tracking tabs"
        >
          <Tab 
            icon={isMobile ? <TodayIcon /> : null} 
            iconPosition="start" 
            label={isMobile ? null : 'Today'}
            {...a11yProps(0)} 
          />
          <Tab 
            icon={isMobile ? <ListIcon /> : null} 
            iconPosition="start" 
            label={isMobile ? null : 'All Entries'}
            {...a11yProps(1)} 
          />
          <Tab 
            icon={isMobile ? <BarChartIcon /> : null} 
            iconPosition="start" 
            label={isMobile ? null : 'Reports'}
            {...a11yProps(2)} 
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <TimeEntriesList 
          showHeader={false}
          pageSize={5}
          onEdit={handleOpenEntryForm}
          onDelete={handleDeleteEntry}
          projects={projects}
        />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <TimeEntriesList 
          showHeader={true}
          showPagination={true}
          onEdit={handleOpenEntryForm}
          onDelete={handleDeleteEntry}
          projects={projects}
        />
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Box p={3} textAlign="center">
          <Typography variant="h5" gutterBottom>
            Time Tracking Reports
          </Typography>
          <Typography color="textSecondary" paragraph>
            Detailed reports and analytics will be available in the next update.
          </Typography>
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={<BarChartIcon />}
          >
            View Sample Report
          </Button>
        </Box>
      </TabPanel>
      
      {/* Time Entry Form Dialog */}
      <TimeEntryForm
        open={showEntryForm}
        onClose={handleCloseEntryForm}
        onSubmit={handleSubmitEntry}
        projects={projects}
        initialData={selectedEntry || {}}
        isLoading={status === 'loading'}
      />
    </Box>
  );
};

export default TimeTrackingPage;
