import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  TablePagination,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Divider,
  Chip,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Description as ReportIcon,
  FileDownload as FileDownloadIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  DateRange as DateRangeIcon,
  PictureAsPdf as PdfIcon,
  GridOn as ExcelIcon,
  Visibility as PreviewIcon,
  MoreVert as MoreVertIcon,
  ArrowDownward as SortIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

// Sample data - in a real app, this would come from an API
const generateSampleReports = (count = 20) => {
  const reportTypes = ['Time Tracking', 'Project Progress', 'Team Performance', 'Expense', 'Invoice'];
  const statuses = ['Generated', 'Pending', 'Failed'];
  const users = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'David Brown'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `RPT-${1000 + i}`,
    name: `${reportTypes[i % reportTypes.length]} Report ${i + 1}`,
    type: reportTypes[i % reportTypes.length],
    generatedBy: users[i % users.length],
    generatedAt: subDays(new Date(), Math.floor(Math.random() * 30)).toISOString(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    format: Math.random() > 0.5 ? 'PDF' : 'Excel',
    size: Math.floor(Math.random() * 5000) + 500, // 500KB to 5.5MB
  }));
};

const Reports = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [reports] = useState(generateSampleReports(20));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: 'week',
    startDate: startOfWeek(new Date()),
    endDate: endOfWeek(new Date()),
    search: '',
  });
  const [sortConfig, setSortConfig] = useState({ key: 'generatedAt', direction: 'desc' });
  const [loading, setLoading] = useState(false);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0);
  };

  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
    setPage(0);
  };

  // Handle date range preset
  const handleDateRangePreset = (range) => {
    const now = new Date();
    let start, end;
    
    switch (range) {
      case 'today':
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'week':
        start = startOfWeek(now);
        end = endOfWeek(now);
        break;
      case 'month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'year':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      default:
        start = filters.startDate;
        end = filters.endDate;
    }
    
    setFilters(prev => ({
      ...prev,
      dateRange: range,
      startDate: start,
      endDate: end,
    }));
  };

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Apply filters and sorting
  const filteredReports = React.useMemo(() => {
    let result = [...reports];
    
    // Apply search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(report => 
        report.name.toLowerCase().includes(searchLower) ||
        report.type.toLowerCase().includes(searchLower) ||
        report.generatedBy.toLowerCase().includes(searchLower) ||
        report.id.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply type filter
    if (filters.type !== 'all') {
      result = result.filter(report => report.type === filters.type);
    }
    
    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter(report => report.status === filters.status);
    }
    
    // Apply date range filter
    if (filters.startDate && filters.endDate) {
      result = result.filter(report => {
        const reportDate = new Date(report.generatedAt);
        return reportDate >= filters.startDate && reportDate <= filters.endDate;
      });
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
  }, [reports, filters, sortConfig]);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle generate report
  const handleGenerateReport = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // In a real app, this would trigger a download or show a preview
      console.log('Generating report...');
    }, 1500);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Generated': return 'success';
      case 'Pending': return 'warning';
      case 'Failed': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h6" component="h2">
            Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Generate and manage project reports
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FileDownloadIcon />}
            onClick={handleGenerateReport}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'New Report'}
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="report tabs"
        >
          <Tab label="All Reports" />
          <Tab label="Time Tracking" />
          <Tab label="Project Progress" />
          <Tab label="Team Performance" />
          <Tab label="Expenses" />
        </Tabs>
      </Card>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Search reports"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                  endAdornment: filters.search && (
                    <IconButton size="small" onClick={() => handleFilterChange('search', '')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type}
                  label="Type"
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="Time Tracking">Time Tracking</MenuItem>
                  <MenuItem value="Project Progress">Project Progress</MenuItem>
                  <MenuItem value="Team Performance">Team Performance</MenuItem>
                  <MenuItem value="Expense">Expense</MenuItem>
                  <MenuItem value="Invoice">Invoice</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="Generated">Generated</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={5}>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Button
                  size="small"
                  variant={filters.dateRange === 'today' ? 'contained' : 'outlined'}
                  onClick={() => handleDateRangePreset('today')}
                >
                  Today
                </Button>
                <Button
                  size="small"
                  variant={filters.dateRange === 'week' ? 'contained' : 'outlined'}
                  onClick={() => handleDateRangePreset('week')}
                >
                  This Week
                </Button>
                <Button
                  size="small"
                  variant={filters.dateRange === 'month' ? 'contained' : 'outlined'}
                  onClick={() => handleDateRangePreset('month')}
                >
                  This Month
                </Button>
                <Button
                  size="small"
                  variant={filters.dateRange === 'year' ? 'contained' : 'outlined'}
                  onClick={() => handleDateRangePreset('year')}
                >
                  This Year
                </Button>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={filters.startDate}
                    onChange={(date) => {
                      handleFilterChange('startDate', date);
                      handleFilterChange('dateRange', 'custom');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        sx={{ width: 150 }}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: <DateRangeIcon fontSize="small" sx={{ mr: 1 }} />,
                        }}
                      />
                    )}
                  />
                  <DatePicker
                    label="End Date"
                    value={filters.endDate}
                    onChange={(date) => {
                      handleFilterChange('endDate', date);
                      handleFilterChange('dateRange', 'custom');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        sx={{ width: 150 }}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: <DateRangeIcon fontSize="small" sx={{ mr: 1 }} />,
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Typography variant="subtitle2">Report Name</Typography>
                      <IconButton size="small" onClick={() => handleSort('name')}>
                        <SortIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Typography variant="subtitle2">Type</Typography>
                      <IconButton size="small" onClick={() => handleSort('type')}>
                        <SortIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Typography variant="subtitle2">Generated By</Typography>
                      <IconButton size="small" onClick={() => handleSort('generatedBy')}>
                        <SortIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Typography variant="subtitle2">Date</Typography>
                      <IconButton size="small" onClick={() => handleSort('generatedAt')}>
                        <SortIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2">Size</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2">Status</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2">Actions</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReports.length > 0 ? (
                  filteredReports
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((report) => (
                      <TableRow key={report.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <ReportIcon color="action" sx={{ mr: 1 }} />
                            <Box>
                              <Typography variant="body2">{report.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {report.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={report.type}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        </TableCell>
                        <TableCell>{report.generatedBy}</TableCell>
                        <TableCell>
                          {format(new Date(report.generatedAt), 'MMM d, yyyy')}
                          <Typography variant="caption" display="block" color="text.secondary">
                            {format(new Date(report.generatedAt), 'h:mm a')}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {formatFileSize(report.size)}
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={report.status}
                            size="small"
                            color={getStatusColor(report.status)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box display="flex" justifyContent="flex-end">
                            <Tooltip title="Preview">
                              <IconButton size="small">
                                <PreviewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download">
                              <IconButton size="small">
                                {report.format === 'PDF' ? (
                                  <PdfIcon fontSize="small" color="error" />
                                ) : (
                                  <ExcelIcon fontSize="small" color="success" />
                                )}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="More options">
                              <IconButton size="small">
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Box textAlign="center">
                        <DescriptionIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                        <Typography variant="body1" color="text.secondary">
                          No reports found matching your criteria
                        </Typography>
                        <Button
                          variant="text"
                          color="primary"
                          onClick={() => {
                            setFilters({
                              type: 'all',
                              status: 'all',
                              dateRange: 'week',
                              startDate: startOfWeek(new Date()),
                              endDate: endOfWeek(new Date()),
                              search: '',
                            });
                          }}
                          sx={{ mt: 1 }}
                        >
                          Clear filters
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {filteredReports.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredReports.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports;
