import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  useMediaQuery,
  Skeleton,
  Tooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  LinearProgress,
  Chip,
  Avatar,
  TextField
} from '@mui/material';
import { 
  MoreVert as MoreIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TableChart as TableIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  FilterAlt as FilterAltIcon
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
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Sample data - replace with actual props
const productivityData = [
  { name: 'Mon', productive: 5.5, neutral: 1.5, unproductive: 1, idle: 0.5 },
  { name: 'Tue', productive: 6, neutral: 1, unproductive: 0.5, idle: 0.5 },
  { name: 'Wed', productive: 4.5, neutral: 2, unproductive: 1, idle: 0.5 },
  { name: 'Thu', productive: 5, neutral: 1.5, unproductive: 0.5, idle: 1 },
  { name: 'Fri', productive: 6.5, neutral: 1, unproductive: 0.5, idle: 0 },
];

const categoryData = [
  { name: 'Development', value: 65 },
  { name: 'Meetings', value: 15 },
  { name: 'Communication', value: 10 },
  { name: 'Research', value: 8 },
  { name: 'Other', value: 2 },
];

const teamData = [
  { name: 'John D.', role: 'Developer', productivity: 85, change: 5, hours: 38.5 },
  { name: 'Jane S.', role: 'Designer', productivity: 78, change: 12, hours: 36 },
  { name: 'Mike J.', role: 'Manager', productivity: 68, change: -3, hours: 32 },
  { name: 'Sarah W.', role: 'Developer', productivity: 72, change: 8, hours: 37 },
  { name: 'David B.', role: 'QA', productivity: 65, change: -2, hours: 34.5 },
];

const ProductivityMetrics = ({ data = {}, loading = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [view, setView] = useState('week');
  const [chartType, setChartType] = useState('bar');
  const [anchorEl, setAnchorEl] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'productivity', direction: 'desc' });
  
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };
  
  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getTrendIcon = (value) => {
    if (value > 0) return <TrendingUpIcon color="success" />;
    if (value < 0) return <TrendingDownIcon color="error" />;
    return <TrendingFlatIcon color="disabled" />;
  };
  
  const getStatusColor = (value) => {
    if (value >= 80) return 'success';
    if (value >= 60) return 'info';
    if (value >= 40) return 'warning';
    return 'error';
  };
  
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={productivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="productive" name="Productive" fill="#00C49F" />
              <Bar dataKey="neutral" name="Neutral" fill="#FFBB28" />
              <Bar dataKey="unproductive" name="Unproductive" fill="#FF8042" />
              <Bar dataKey="idle" name="Idle" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={productivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="productive" 
                name="Productive" 
                stroke="#00C49F" 
                strokeWidth={2} 
                dot={{ r: 4 }} 
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="neutral" 
                name="Neutral" 
                stroke="#FFBB28" 
                strokeWidth={2} 
                dot={{ r: 4 }} 
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="unproductive" 
                name="Unproductive" 
                stroke="#FF8042" 
                strokeWidth={2} 
                dot={{ r: 4 }} 
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="idle" 
                name="Idle" 
                stroke="#8884d8" 
                strokeWidth={2} 
                dot={{ r: 4 }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={productivityData}>
              <defs>
                <linearGradient id="colorProductive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00C49F" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFBB28" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#FFBB28" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorUnproductive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF8042" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#FF8042" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorIdle" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="productive" 
                name="Productive" 
                stroke="#00C49F" 
                fillOpacity={1} 
                fill="url(#colorProductive)" 
              />
              <Area 
                type="monotone" 
                dataKey="neutral" 
                name="Neutral" 
                stroke="#FFBB28" 
                fillOpacity={1} 
                fill="url(#colorNeutral)" 
              />
              <Area 
                type="monotone" 
                dataKey="unproductive" 
                name="Unproductive" 
                stroke="#FF8042" 
                fillOpacity={1} 
                fill="url(#colorUnproductive)" 
              />
              <Area 
                type="monotone" 
                dataKey="idle" 
                name="Idle" 
                stroke="#8884d8" 
                fillOpacity={1} 
                fill="url(#colorIdle)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'radar':
        return (
          <Box display="flex" justifyContent="center" mt={4}>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart outerRadius={150} data={categoryData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar 
                  name="Productivity by Category" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6} 
                />
                <RechartsTooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </Box>
        );
      default:
        return null;
    }
  };
  
  // Filter and sort team data
  const filteredAndSortedTeamData = React.useMemo(() => {
    let filtered = [...teamData];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        user => 
          user.name.toLowerCase().includes(term) || 
          user.role.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filtered;
  }, [teamData, searchTerm, sortConfig]);
  
  // Pagination
  const paginatedData = filteredAndSortedTeamData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  // Loading state
  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={400} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Header and Controls */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Typography variant="h5" component="h2">
          Productivity Metrics
        </Typography>
        
        <Box display="flex" gap={1} flexWrap="wrap">
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleViewChange}
            size="small"
            aria-label="time range"
          >
            <ToggleButton value="day" aria-label="day">
              Day
            </ToggleButton>
            <ToggleButton value="week" aria-label="week">
              Week
            </ToggleButton>
            <ToggleButton value="month" aria-label="month">
              Month
            </ToggleButton>
          </ToggleButtonGroup>
          
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={handleChartTypeChange}
            size="small"
            aria-label="chart type"
          >
            <Tooltip title="Bar Chart">
              <ToggleButton value="bar" aria-label="bar chart">
                <BarChartIcon />
              </ToggleButton>
            </Tooltip>
            <Tooltip title="Line Chart">
              <ToggleButton value="line" aria-label="line chart">
                <TimelineIcon />
              </ToggleButton>
            </Tooltip>
            <Tooltip title="Area Chart">
              <ToggleButton value="area" aria-label="area chart">
                <PieChartIcon />
              </ToggleButton>
            </Tooltip>
            <Tooltip title="Radar Chart">
              <ToggleButton value="radar" aria-label="radar chart">
                <TimelineIcon />
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
                <ListItemText>Export as PDF</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <DownloadIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Export as CSV</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem>
                <ListItemIcon>
                  <RefreshIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Refresh Data</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Box>
      
      {/* Main Chart */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title={`${view.charAt(0).toUpperCase() + view.slice(1)}ly Productivity Overview`}
          subheader={`Showing data for the ${view}`}
          action={
            <IconButton size="small">
              <FilterIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>
      
      {/* Team Performance */}
      <Card>
        <CardHeader 
          title="Team Performance"
          subheader="Productivity metrics by team member"
          action={
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                size="small"
                placeholder="Search team..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ width: 200 }}
              />
              <Tooltip title="Filter">
                <IconButton size="small">
                  <FilterAltIcon />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        <Divider />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  onClick={() => handleSort('name')}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <Box display="flex" alignItems="center">
                    <Typography variant="subtitle2">Team Member</Typography>
                    <SortIcon fontSize="small" sx={{ ml: 0.5, opacity: 0.5 }} />
                  </Box>
                </TableCell>
                <TableCell>Role</TableCell>
                <TableCell align="right">Hours Tracked</TableCell>
                <TableCell 
                  align="right"
                  onClick={() => handleSort('productivity')}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <Box display="flex" alignItems="center" justifyContent="flex-end">
                    <Typography variant="subtitle2">Productivity</Typography>
                    <SortIcon 
                      fontSize="small" 
                      sx={{ 
                        ml: 0.5, 
                        opacity: 0.5,
                        transform: sortConfig.key === 'productivity' && sortConfig.direction === 'desc' 
                          ? 'rotate(180deg)' 
                          : 'none' 
                      }} 
                    />
                  </Box>
                </TableCell>
                <TableCell align="right">Trend</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((user, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: 'primary.main' }}>
                        {user.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">{user.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      size="small" 
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">{user.hours} hrs</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" alignItems="center" justifyContent="flex-end">
                      <Box width={100} mr={2}>
                        <LinearProgress 
                          variant="determinate" 
                          value={user.productivity} 
                          color={getStatusColor(user.productivity)}
                          sx={{ height: 6, borderRadius: 3 }} 
                        />
                      </Box>
                      <Typography variant="body2" minWidth={40}>
                        {user.productivity}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" alignItems="center" justifyContent="flex-end">
                      {getTrendIcon(user.change)}
                      <Typography 
                        variant="body2" 
                        color={user.change > 0 ? 'success.main' : user.change < 0 ? 'error.main' : 'text.secondary'}
                        ml={0.5}
                      >
                        {Math.abs(user.change)}%
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              
              {filteredAndSortedTeamData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Box display="flex" flexDirection="column" alignItems="center">
                      <SearchIcon fontSize="large" color="disabled" sx={{ mb: 1 }} />
                      <Typography color="text.secondary">
                        No team members found matching your search
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAndSortedTeamData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Box>
  );
};

export default ProductivityMetrics;
