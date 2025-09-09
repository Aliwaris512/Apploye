import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  Refresh as RefreshIcon,
  DateRange as DateRangeIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { format, subDays } from 'date-fns';

// Register ChartJS components
ChartJS.register(...registerables);

// Sample data - in a real app, this would come from an API
const projectData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'Completed',
      data: [12, 19, 3, 5, 2, 3, 15],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    },
    {
      label: 'In Progress',
      data: [5, 10, 12, 8, 15, 10, 8],
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    },
    {
      label: 'Not Started',
      data: [8, 5, 10, 12, 8, 12, 5],
      backgroundColor: 'rgba(255, 99, 132, 0.6)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
    },
  ],
};

const teamPerformanceData = {
  labels: ['John D.', 'Jane S.', 'Mike J.', 'Sarah W.', 'David B.'],
  datasets: [
    {
      label: 'Tasks Completed',
      data: [12, 19, 3, 5, 2],
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

const taskStatusData = {
  labels: ['Completed', 'In Progress', 'Not Started', 'Blocked'],
  datasets: [
    {
      data: [30, 25, 15, 5],
      backgroundColor: [
        'rgba(75, 192, 192, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(255, 99, 132, 0.6)',
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(255, 99, 132, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

const timeTrackingData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Hours Tracked',
      data: [6.5, 7.2, 5.8, 8.1, 6.9, 2.5, 1.2],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      tension: 0.3,
      fill: true,
    },
  ],
};

const AnalyticsDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [timeRange, setTimeRange] = useState('week');
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 7),
    end: new Date(),
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
    // In a real app, you would fetch new data based on the selected time range
  };

  const refreshData = () => {
    // In a real app, this would refetch the data
    console.log('Refreshing data...');
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Overview
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Project Progress</Typography>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={timeRange}
                        onChange={handleTimeRangeChange}
                        IconComponent={ArrowDropDownIcon}
                        variant="outlined"
                        size="small"
                      >
                        <MenuItem value="week">This Week</MenuItem>
                        <MenuItem value="month">This Month</MenuItem>
                        <MenuItem value="quarter">This Quarter</MenuItem>
                        <MenuItem value="year">This Year</MenuItem>
                        <MenuItem value="all">All Time</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <Box height={300}>
                    <Bar data={projectData} options={chartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" mb={2}>
                    Task Status
                  </Typography>
                  <Box height={300}>
                    <Doughnut data={taskStatusData} options={chartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" mb={2}>
                    Team Performance
                  </Typography>
                  <Box height={300}>
                    <Bar
                      data={teamPerformanceData}
                      options={{
                        ...chartOptions,
                        indexAxis: 'y',
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" mb={2}>
                    Time Tracking
                  </Typography>
                  <Box height={300}>
                    <Line data={timeTrackingData} options={chartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      case 1: // Projects
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Projects Overview
              </Typography>
              <Box height={400}>
                <Bar data={projectData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        );
      case 2: // Team
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Team Performance
              </Typography>
              <Box height={400}>
                <Bar
                  data={teamPerformanceData}
                  options={{
                    ...chartOptions,
                    indexAxis: 'y',
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        );
      case 3: // Time Tracking
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Time Tracking
              </Typography>
              <Box height={400}>
                <Line data={timeTrackingData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h6" component="h2">
            Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and analyze project and team performance
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <IconButton onClick={refreshData} size={isMobile ? 'small' : 'medium'}>
            <RefreshIcon />
          </IconButton>
          <FormControl size={isMobile ? 'small' : 'medium'}>
            <InputLabel id="date-range-label">Date Range</InputLabel>
            <Select
              labelId="date-range-label"
              value={timeRange}
              label="Date Range"
              onChange={handleTimeRangeChange}
              size={isMobile ? 'small' : 'medium'}
            >
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="analytics tabs"
        >
          <Tab icon={<AssessmentIcon />} label="Overview" />
          <Tab icon={<WorkIcon />} label="Projects" />
          <Tab icon={<PeopleIcon />} label="Team" />
          <Tab icon={<TimelineIcon />} label="Time Tracking" />
        </Tabs>
      </Card>

      {renderTabContent()}
    </Box>
  );
};

export default AnalyticsDashboard;
