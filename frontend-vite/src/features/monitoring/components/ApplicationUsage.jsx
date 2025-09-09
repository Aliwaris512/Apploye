import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Avatar,
  Chip,
  LinearProgress,
  Tooltip,
  useTheme,
  useMediaQuery,
  ToggleButton,
  ToggleButtonGroup,
  Skeleton
} from '@mui/material';
import { 
  MoreVert as MoreIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Apps as AppsIcon,
  Sort as SortIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';

// Sample data - replace with actual props
const appData = [
  { 
    id: 1, 
    name: 'Visual Studio Code', 
    category: 'Development', 
    timeSpent: 1250, // in minutes
    sessions: 24,
    change: 12,
    icon: 'vscode',
    lastUsed: '2023-05-15T14:30:00Z'
  },
  { 
    id: 2, 
    name: 'Google Chrome', 
    category: 'Browsing', 
    timeSpent: 980, 
    sessions: 42,
    change: -5,
    icon: 'chrome',
    lastUsed: '2023-05-16T09:15:00Z'
  },
  { 
    id: 3, 
    name: 'Slack', 
    category: 'Communication', 
    timeSpent: 450, 
    sessions: 68,
    change: 8,
    icon: 'slack',
    lastUsed: '2023-05-16T13:45:00Z'
  },
  { 
    id: 4, 
    name: 'Terminal', 
    category: 'Development', 
    timeSpent: 320, 
    sessions: 56,
    change: 15,
    icon: 'terminal',
    lastUsed: '2023-05-16T11:20:00Z'
  },
  { 
    id: 5, 
    name: 'Figma', 
    category: 'Design', 
    timeSpent: 280, 
    sessions: 18,
    change: 3,
    icon: 'figma',
    lastUsed: '2023-05-15T16:10:00Z'
  },
  { 
    id: 6, 
    name: 'Microsoft Teams', 
    category: 'Communication', 
    timeSpent: 390, 
    sessions: 32,
    change: -2,
    icon: 'teams',
    lastUsed: '2023-05-16T10:30:00Z'
  },
  { 
    id: 7, 
    name: 'Postman', 
    category: 'Development', 
    timeSpent: 210, 
    sessions: 29,
    change: 7,
    icon: 'postman',
    lastUsed: '2023-05-16T14:15:00Z'
  },
  { 
    id: 8, 
    name: 'Spotify', 
    category: 'Entertainment', 
    timeSpent: 180, 
    sessions: 12,
    change: -8,
    icon: 'spotify',
    lastUsed: '2023-05-16T15:30:00Z'
  }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#FF6B6B', '#4ECDC4'];

const ApplicationUsage = ({ data = {}, loading = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [view, setView] = useState('table');
  const [timeRange, setTimeRange] = useState('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'timeSpent', direction: 'desc' });
  
  // Handle view change
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };
  
  // Handle time range change
  const handleTimeRangeChange = (event, newRange) => {
    if (newRange !== null) {
      setTimeRange(newRange);
    }
  };
  
  // Handle menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Format time
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Get trend icon
  const getTrendIcon = (value) => {
    if (value > 0) return <TrendingUpIcon color="success" fontSize="small" />;
    if (value < 0) return <TrendingDownIcon color="error" fontSize="small" />;
    return <TrendingFlatIcon color="disabled" fontSize="small" />;
  };
  
  // Get app icon
  const getAppIcon = (app) => {
    // In a real app, you would use the app's icon or a fallback
    return (
      <Avatar 
        sx={{ 
          bgcolor: COLORS[app.id % COLORS.length],
          width: 32, 
          height: 32,
          fontSize: '0.875rem'
        }}
      >
        {app.name.charAt(0)}
      </Avatar>
    );
  };
  
  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let result = [...appData];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        app => 
          app.name.toLowerCase().includes(term) || 
          app.category.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  }, [appData, searchTerm, sortConfig]);
  
  // Get paginated data
  const paginatedData = useMemo(() => {
    return filteredAndSortedData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredAndSortedData, page, rowsPerPage]);
  
  // Get chart data
  const chartData = useMemo(() => {
    return filteredAndSortedData
      .slice(0, 8) // Limit to top 8 for better visualization
      .map(app => ({
        name: app.name,
        time: app.timeSpent / 60, // Convert to hours
        category: app.category,
        sessions: app.sessions,
        change: app.change
      }));
  }, [filteredAndSortedData]);
  
  // Get category distribution
  const categoryDistribution = useMemo(() => {
    const categories = {};
    
    filteredAndSortedData.forEach(app => {
      if (!categories[app.category]) {
        categories[app.category] = 0;
      }
      categories[app.category] += app.timeSpent;
    });
    
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value: Math.round((value / 60) * 10) / 10, // Convert to hours with 1 decimal
      percent: Math.round((value / filteredAndSortedData.reduce((sum, app) => sum + app.timeSpent, 0)) * 100)
    }));
  }, [filteredAndSortedData]);
  
  // Loading state
  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={400} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }
  
  // Render table view
  const renderTableView = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Application</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={sortConfig.key === 'timeSpent'}
                direction={sortConfig.key === 'timeSpent' ? sortConfig.direction : 'desc'}
                onClick={() => handleSort('timeSpent')}
              >
                Time Spent
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">Sessions</TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={sortConfig.key === 'change'}
                direction={sortConfig.key === 'change' ? sortConfig.direction : 'desc'}
                onClick={() => handleSort('change')}
              >
                Trend
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">Last Used</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedData.map((app) => (
            <TableRow key={app.id} hover>
              <TableCell>
                <Box display="flex" alignItems="center">
                  {getAppIcon(app)}
                  <Box ml={2}>
                    <Typography variant="body2">{app.name}</Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Chip 
                  label={app.category} 
                  size="small" 
                  variant="outlined"
                  color="primary"
                />
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  {formatTime(app.timeSpent)}
                </Typography>
                <Box mt={0.5}>
                  <LinearProgress 
                    variant="determined" 
                    value={Math.min((app.timeSpent / 1440) * 100, 100)} 
                    color="primary"
                    sx={{ height: 4, borderRadius: 2 }}
                  />
                </Box>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">{app.sessions}</Typography>
              </TableCell>
              <TableCell align="right">
                <Box display="flex" alignItems="center" justifyContent="flex-end">
                  {getTrendIcon(app.change)}
                  <Typography 
                    variant="body2" 
                    color={app.change > 0 ? 'success.main' : app.change < 0 ? 'error.main' : 'text.secondary'}
                    ml={0.5}
                  >
                    {Math.abs(app.change)}%
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" color="textSecondary">
                  {new Date(app.lastUsed).toLocaleDateString()}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <IconButton size="small">
                  <MoreIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          
          {filteredAndSortedData.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <SearchIcon fontSize="large" color="disabled" sx={{ mb: 1 }} />
                  <Typography color="text.secondary">
                    No applications found matching your search
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredAndSortedData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  );
  
  // Render chart view
  const renderChartView = () => (
    <Box mt={3}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Top Applications by Time Spent" />
            <Divider />
            <CardContent>
              <Box height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip 
                      formatter={(value) => [`${value} hours`, 'Time Spent']}
                      labelFormatter={(label) => `App: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="time" name="Hours" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Time by Category" />
            <Divider />
            <CardContent>
              <Box height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value, name, props) => [`${value} hours`, name]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
  
  return (
    <Box>
      {/* Header and Controls */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Typography variant="h5" component="h2">
          Application Usage
        </Typography>
        
        <Box display="flex" gap={1} flexWrap="wrap">
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={handleTimeRangeChange}
            size="small"
            aria-label="time range"
          >
            <ToggleButton value="day">Day</ToggleButton>
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
          </ToggleButtonGroup>
          
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleViewChange}
            size="small"
            aria-label="view type"
          >
            <Tooltip title="Table View">
              <ToggleButton value="table">
                <ViewListIcon />
              </ToggleButton>
            </Tooltip>
            <Tooltip title="Chart View">
              <ToggleButton value="chart">
                <BarChartIcon />
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>
          
          <Box>
            <IconButton onClick={handleMenuOpen} size="small">
              <MoreIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem>
                <ListItemIcon>
                  <DownloadIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Export Data</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <RefreshIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Refresh</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Box>
      
      {/* Search and Filter */}
      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search applications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearchTerm('')}
                  edge="end"
                >
                  <Box component="span" sx={{ fontSize: '1rem' }}>×</Box>
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      {/* Content */}
      {view === 'table' ? renderTableView() : renderChartView()}
    </Box>
  );
};

export default ApplicationUsage;
