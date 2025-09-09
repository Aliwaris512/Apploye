import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Divider, 
  useTheme,
  useMediaQuery,
  Skeleton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip
} from '@mui/material';
import { 
  AccessTime as TimeIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  MoreVert as MoreIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, parseISO } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ActivityStats = ({ data = {}, loading = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  
  // Sample data for the charts (replace with actual data from props)
  const activityData = [
    { name: 'Mon', active: 4000, idle: 2400, productive: 2400 },
    { name: 'Tue', active: 3000, idle: 1398, productive: 2210 },
    { name: 'Wed', active: 2000, idle: 9800, productive: 2290 },
    { name: 'Thu', active: 2780, idle: 3908, productive: 2000 },
    { name: 'Fri', active: 1890, idle: 4800, productive: 2181 },
    { name: 'Sat', active: 2390, idle: 3800, productive: 2500 },
    { name: 'Sun', active: 3490, idle: 4300, productive: 2100 },
  ];
  
  const pieData = [
    { name: 'Productive', value: 45 },
    { name: 'Neutral', value: 25 },
    { name: 'Unproductive', value: 15 },
    { name: 'Idle', value: 15 },
  ];
  
  const topApps = [
    { id: 1, name: 'Visual Studio Code', time: '5h 23m', category: 'Development', change: 12 },
    { id: 2, name: 'Google Chrome', time: '3h 45m', category: 'Browsing', change: -5 },
    { id: 3, name: 'Slack', time: '2h 30m', category: 'Communication', change: 8 },
    { id: 4, name: 'Terminal', time: '1h 45m', category: 'Development', change: 3 },
    { id: 5, name: 'Figma', time: '1h 15m', category: 'Design', change: 15 },
  ];
  
  const topUsers = [
    { id: 1, name: 'John Doe', role: 'Developer', time: '8h 23m', productivity: 78, change: 5 },
    { id: 2, name: 'Jane Smith', role: 'Designer', time: '7h 45m', productivity: 85, change: 12 },
    { id: 3, name: 'Mike Johnson', role: 'Manager', time: '6h 30m', productivity: 65, change: -3 },
    { id: 4, name: 'Sarah Williams', role: 'Developer', time: '7h 15m', productivity: 72, change: 8 },
    { id: 5, name: 'David Brown', role: 'QA Engineer', time: '6h 50m', productivity: 68, change: -2 },
  ];
  
  // Handle change page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle change rows per page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Get trend icon
  const getTrendIcon = (value) => {
    if (value > 0) return <TrendingUpIcon color="success" />;
    if (value < 0) return <TrendingDownIcon color="error" />;
    return <TrendingFlatIcon color="disabled" />;
  };
  
  // Get status color
  const getStatusColor = (value) => {
    if (value >= 80) return 'success';
    if (value >= 60) return 'info';
    if (value >= 40) return 'warning';
    return 'error';
  };
  
  // Format time
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
        
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} sx={{ mt: 2 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={400} sx={{ mt: 2 }} />
          </Grid>
        </Grid>
        
        <Skeleton variant="rectangular" height={400} sx={{ mt: 3 }} />
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Stats Overview */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    Total Active Time
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h4" component="div">
                      {formatTime(325)}
                    </Typography>
                    <Box ml={1} display="flex" alignItems="center" color="success.main">
                      <ArrowUpwardIcon fontSize="small" />
                      <Typography variant="caption" color="textSecondary">
                        12%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light', width: 48, height: 48 }}>
                  <TimeIcon />
                </Avatar>
              </Box>
              <Box mt={2}>
                <LinearProgress variant="determinate" value={75} color="primary" sx={{ height: 6, borderRadius: 3 }} />
                <Box display="flex" justifyContent="space-between" mt={0.5}>
                  <Typography variant="caption" color="textSecondary">
                    vs last week
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    75% of goal
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    Productivity Score
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h4" component="div">
                      78%
                    </Typography>
                    <Box ml={1} display="flex" alignItems="center" color="success.main">
                      <ArrowUpwardIcon fontSize="small" />
                      <Typography variant="caption" color="textSecondary">
                        5%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'success.light', width: 48, height: 48, color: 'success.dark' }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
              <Box mt={2}>
                <LinearProgress variant="determinate" value={78} color="success" sx={{ height: 6, borderRadius: 3 }} />
                <Box display="flex" justifyContent="space-between" mt={0.5}>
                  <Typography variant="caption" color="textSecondary">
                    vs last week
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    +5% from last week
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    Active Users
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h4" component="div">
                      24/45
                    </Typography>
                    <Box ml={1} display="flex" alignItems="center" color="success.main">
                      <ArrowUpwardIcon fontSize="small" />
                      <Typography variant="caption" color="textSecondary">
                        3
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'info.light', width: 48, height: 48, color: 'info.dark' }}>
                  <PersonIcon />
                </Avatar>
              </Box>
              <Box mt={2}>
                <LinearProgress variant="determinate" value={53} color="info" sx={{ height: 6, borderRadius: 3 }} />
                <Box display="flex" justifyContent="space-between" mt={0.5}>
                  <Typography variant="caption" color="textSecondary">
                    vs yesterday
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    +3 users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    Idle Time
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h4" component="div">
                      1h 15m
                    </Typography>
                    <Box ml={1} display="flex" alignItems="center" color="error.main">
                      <ArrowDownwardIcon fontSize="small" />
                      <Typography variant="caption" color="textSecondary">
                        10%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.light', width: 48, height: 48, color: 'warning.dark' }}>
                  <TimerIcon />
                </Avatar>
              </Box>
              <Box mt={2}>
                <LinearProgress variant="determinate" value={15} color="warning" sx={{ height: 6, borderRadius: 3 }} />
                <Box display="flex" justifyContent="space-between" mt={0.5}>
                  <Typography variant="caption" color="textSecondary">
                    vs last week
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    -10% from last week
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Weekly Activity Overview" 
              subheader="Tracked hours and productivity trends"
              action={
                <IconButton size="small">
                  <MoreIcon />
                </IconButton>
              }
            />
            <Divider />
            <Box p={3} pt={2}>
              <Box height={350}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={activityData}
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
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="productive" stackId="a" fill="#00C49F" name="Productive" />
                    <Bar dataKey="idle" stackId="a" fill="#FFBB28" name="Idle" />
                    <Bar dataKey="active" fill="#8884d8" name="Active" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Productivity Distribution" 
              subheader="Breakdown of time spent"
              action={
                <IconButton size="small">
                  <MoreIcon />
                </IconButton>
              }
            />
            <Divider />
            <Box p={3} pt={2}>
              <Box height={350}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              
              <Box mt={2}>
                <List disablePadding>
                  {pieData.map((item, index) => (
                    <ListItem 
                      key={index} 
                      disableGutters 
                      sx={{ 
                        px: 0,
                        '&:not(:last-child)': { 
                          mb: 1,
                          pb: 1,
                          borderBottom: '1px solid',
                          borderColor: 'divider'
                        } 
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 32 }}>
                        <Box 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            bgcolor: COLORS[index % COLORS.length],
                            mt: 0.5
                          }} 
                        />
                      </ListItemAvatar>
                      <ListItemText 
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2">
                              {item.name}
                            </Typography>
                            <Typography variant="subtitle2">
                              {item.value}%
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <LinearProgress 
                            variant="determinate" 
                            value={item.value} 
                            color={index === 0 ? 'success' : index === 1 ? 'info' : index === 2 ? 'warning' : 'error'}
                            sx={{ 
                              height: 6, 
                              borderRadius: 3, 
                              mt: 0.5,
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                              }
                            }} 
                          />
                        }
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
      
      {/* Top Users */}
      <Card sx={{ mt: 3 }}>
        <CardHeader 
          title="Top Performers" 
          subheader="Most productive team members this week"
          action={
            <IconButton size="small">
              <MoreIcon />
            </IconButton>
          }
        />
        <Divider />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell align="center">Role</TableCell>
                <TableCell align="center">Active Time</TableCell>
                <TableCell align="center">Productivity</TableCell>
                <TableCell align="right">Trend</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ width: 36, height: 36, mr: 2 }}>
                        {user.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">{user.name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {user.role}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center">{user.role}</TableCell>
                  <TableCell align="center">{user.time}</TableCell>
                  <TableCell align="center">
                    <Box display="flex" alignItems="center" justifyContent="center">
                      <Box width="100%" maxWidth={100} mr={1}>
                        <LinearProgress 
                          variant="determinate" 
                          value={user.productivity} 
                          color={getStatusColor(user.productivity)}
                          sx={{ height: 6, borderRadius: 3 }} 
                        />
                      </Box>
                      <Typography variant="body2" color="textSecondary">
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
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={topUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Box>
  );
};

export default ActivityStats;
