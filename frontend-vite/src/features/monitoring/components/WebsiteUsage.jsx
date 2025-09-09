import React, { useState, useMemo } from 'react';
import { 
  Box, Typography, Card, CardContent, CardHeader, Divider, 
  IconButton, Menu, MenuItem, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination,
  TableSortLabel, Avatar, Chip, LinearProgress, Tooltip, useTheme,
  useMediaQuery, ToggleButton, ToggleButtonGroup, Skeleton, Grid, Button
} from '@mui/material';
import { 
  MoreVert, Search, FilterList, Download, Refresh, Public, 
  Sort, ArrowUpward, ArrowDownward, TrendingUp, TrendingDown, 
  TrendingFlat, BarChart, PieChart, Timeline, ViewList, Language, Link, AccessTime
} from '@mui/icons-material';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart as RePieChart, 
  Pie, Cell, LineChart as ReLineChart, Line } from 'recharts';

// Sample data
const websiteData = [
  { id: 1, domain: 'github.com', category: 'Development', timeSpent: 320, visits: 42, change: 15, lastVisited: '2023-05-16T14:30:00Z' },
  { id: 2, domain: 'stackoverflow.com', category: 'Development', timeSpent: 280, visits: 38, change: 8, lastVisited: '2023-05-16T15:15:00Z' },
  { id: 3, domain: 'linkedin.com', category: 'Social', timeSpent: 150, visits: 12, change: -5, lastVisited: '2023-05-16T11:20:00Z' },
  { id: 4, domain: 'youtube.com', category: 'Entertainment', timeSpent: 180, visits: 8, change: -12, lastVisited: '2023-05-15T16:45:00Z' },
  { id: 5, domain: 'medium.com', category: 'Learning', timeSpent: 95, visits: 15, change: 22, lastVisited: '2023-05-16T10:10:00Z' },
  { id: 6, domain: 'dev.to', category: 'Development', timeSpent: 120, visits: 24, change: 18, lastVisited: '2023-05-16T09:30:00Z' },
  { id: 7, domain: 'twitter.com', category: 'Social', timeSpent: 85, visits: 32, change: -3, lastVisited: '2023-05-16T13:15:00Z' },
  { id: 8, domain: 'reddit.com', category: 'Entertainment', timeSpent: 65, visits: 18, change: -8, lastVisited: '2023-05-15T17:30:00Z' }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#FF6B6B', '#4ECDC4'];

const WebsiteUsage = () => {
  const theme = useTheme();
  const [view, setView] = useState('table');
  const [timeRange, setTimeRange] = useState('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({ key: 'timeSpent', direction: 'desc' });
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let result = [...websiteData];
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      result = result.filter(site => site.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(site => 
        site.domain.toLowerCase().includes(term) || 
        site.category.toLowerCase().includes(term)
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
  }, [searchTerm, sortConfig, selectedCategory]);

  // Get paginated data
  const paginatedData = useMemo(() => {
    return filteredAndSortedData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredAndSortedData, page, rowsPerPage]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(websiteData.map(item => item.category))];
    return ['All', ...uniqueCategories];
  }, []);

  // Format time
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Get trend icon
  const getTrendIcon = (value) => {
    if (value > 0) return <TrendingUp color="success" fontSize="small" />;
    if (value < 0) return <TrendingDown color="error" fontSize="small" />;
    return <TrendingFlat color="disabled" fontSize="small" />;
  };

  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <Box>
      {/* Header and Controls */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Typography variant="h5">Website Usage</Typography>
        
        <Box display="flex" gap={1}>
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={(e, newRange) => newRange && setTimeRange(newRange)}
            size="small"
          >
            <ToggleButton value="day">Day</ToggleButton>
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
          </ToggleButtonGroup>
          
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(e, newView) => newView && setView(newView)}
            size="small"
          >
            <ToggleButton value="table"><ViewList /></ToggleButton>
            <ToggleButton value="chart"><BarChart /></ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Search and Category Filter */}
      <Box mb={3} display="flex" gap={2} flexWrap="wrap">
        <TextField
          size="small"
          placeholder="Search websites..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ minWidth: 200 }}
        />
        
        <Box display="flex" gap={1} flexWrap="wrap">
          {categories.map(category => (
            <Chip
              key={category}
              label={category}
              onClick={() => setSelectedCategory(category)}
              color={selectedCategory === category ? 'primary' : 'default'}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
              size="small"
            />
          ))}
        </Box>
      </Box>

      {/* Content */}
      {view === 'table' ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Website</TableCell>
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
                <TableCell align="right">Visits</TableCell>
                <TableCell align="right">Trend</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((site) => (
                <TableRow key={site.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar 
                        src={`https://www.google.com/s2/favicons?domain=${site.domain}&sz=32`}
                        variant="rounded"
                        sx={{ width: 24, height: 24 }}
                      />
                      {site.domain}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={site.category} 
                      size="small" 
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {formatTime(site.timeSpent)}
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((site.timeSpent / 480) * 100, 100)} 
                      color="primary"
                      sx={{ height: 4, mt: 0.5 }}
                    />
                  </TableCell>
                  <TableCell align="right">{site.visits}</TableCell>
                  <TableCell align="right">
                    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                      {getTrendIcon(site.change)}
                      <Typography variant="body2" color={site.change > 0 ? 'success.main' : site.change < 0 ? 'error.main' : 'text.secondary'}>
                        {Math.abs(site.change)}%
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredAndSortedData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </TableContainer>
      ) : (
        <Box mt={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader title="Top Websites by Time Spent" />
                <Divider />
                <CardContent sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={paginatedData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="domain" />
                      <YAxis />
                      <RechartsTooltip 
                        formatter={(value) => [`${value} minutes`, 'Time Spent']}
                        labelFormatter={(label) => `Website: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="timeSpent" name="Time (min)" fill="#8884d8" />
                    </ReBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardHeader title="Time by Category" />
                <Divider />
                <CardContent sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={categories.slice(1).map(cat => ({
                          name: cat,
                          value: filteredAndSortedData
                            .filter(site => site.category === cat)
                            .reduce((sum, site) => sum + site.timeSpent, 0)
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categories.slice(1).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value) => [`${Math.round(value / 60 * 10) / 10} hours`, 'Time Spent']}
                      />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default WebsiteUsage;
