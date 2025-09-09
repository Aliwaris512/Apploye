import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  ListItemSecondaryAction, 
  IconButton, 
  Button, 
  Divider, 
  Paper, 
  Chip, 
  Menu, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  TextField, 
  InputAdornment, 
  Tooltip, 
  Badge,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
} from '@mui/material';
import { 
  FilterList as FilterListIcon, 
  Sort as SortIcon, 
  Refresh as RefreshIcon, 
  MarkEmailRead as MarkEmailReadIcon, 
  Email as EmailIcon, 
  Delete as DeleteIcon, 
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification, 
  clearAllNotifications,
  selectAllNotifications,
  selectUnreadCount,
  selectNotificationsLoading,
  selectNotificationsError,
  selectNotificationsPagination,
  selectNotificationsFilters,
  selectNotificationsSort,
  setFilters,
  setSort,
  setPagination,
  resetNotifications,
} from '../features/notifications/notificationsSlice';

const NotificationsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  // Selectors
  const notifications = useSelector(selectAllNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const loading = useSelector(selectNotificationsLoading);
  const error = useSelector(selectNotificationsError);
  const pagination = useSelector(selectNotificationsPagination);
  const filters = useSelector(selectNotificationsFilters);
  const sort = useSelector(selectNotificationsSort);
  
  // Local state
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  
  // Fetch notifications when filters, sort, or pagination changes
  useEffect(() => {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      sortBy: sort.field,
      sortOrder: sort.order,
      search: searchQuery,
      read: filters.read,
      type: filters.type,
      startDate: dateRange[0] ? format(dateRange[0], 'yyyy-MM-dd') : null,
      endDate: dateRange[1] ? format(dateRange[1], 'yyyy-MM-dd') : null,
    };
    
    dispatch(fetchNotifications(params));
    
    // Cleanup on unmount
    return () => {
      dispatch(resetNotifications());
    };
  }, [dispatch, pagination.page, pagination.pageSize, sort, filters, searchQuery, dateRange]);
  
  // Handle menu open/close
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle mark as read
  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationAsRead(notificationId))
      .unwrap()
      .then(() => {
        enqueueSnackbar('Notification marked as read', { variant: 'success' });
      })
      .catch((error) => {
        enqueueSnackbar(error || 'Failed to mark notification as read', { variant: 'error' });
      });
  };
  
  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;
    
    dispatch(markAllNotificationsAsRead())
      .unwrap()
      .then(() => {
        enqueueSnackbar('All notifications marked as read', { variant: 'success' });
      })
      .catch((error) => {
        enqueueSnackbar(error || 'Failed to mark all notifications as read', { variant: 'error' });
      });
  };
  
  // Handle delete notification
  const handleDeleteNotification = (notificationId) => {
    dispatch(deleteNotification(notificationId))
      .unwrap()
      .then(() => {
        enqueueSnackbar('Notification deleted', { variant: 'success' });
      })
      .catch((error) => {
        enqueueSnackbar(error || 'Failed to delete notification', { variant: 'error' });
      });
  };
  
  // Handle clear all notifications
  const handleClearAll = () => {
    if (notifications.length === 0) return;
    
    if (window.confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      dispatch(clearAllNotifications())
        .unwrap()
        .then(() => {
          enqueueSnackbar('All notifications cleared', { variant: 'success' });
        })
        .catch((error) => {
          enqueueSnackbar(error || 'Failed to clear all notifications', { variant: 'error' });
        });
    }
  };
  
  // Handle filter change
  const handleFilterChange = (filter) => {
    dispatch(setFilters(filter));
    // Reset to first page when filters change
    dispatch(setPagination({ page: 1 }));
  };
  
  // Handle sort change
  const handleSortChange = (field) => {
    const order = sort.field === field && sort.order === 'asc' ? 'desc' : 'asc';
    dispatch(setSort({ field, order }));
  };
  
  // Handle pagination change
  const handlePageChange = (event, newPage) => {
    dispatch(setPagination({ page: newPage + 1 }));
  };
  
  // Handle rows per page change
  const handleRowsPerPageChange = (event) => {
    dispatch(setPagination({ 
      page: 1, // Reset to first page
      pageSize: parseInt(event.target.value, 10) 
    }));
  };
  
  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    // Navigate to the link if available
    if (notification.link) {
      navigate(notification.link);
    }
  };
  
  // Toggle notification selection
  const toggleNotificationSelection = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };
  
  // Select all notifications
  const selectAllNotifications = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };
  
  // Handle bulk actions
  const handleBulkAction = (action) => {
    switch (action) {
      case 'markAsRead':
        selectedNotifications.forEach(id => handleMarkAsRead(id));
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedNotifications.length} selected notifications?`)) {
          selectedNotifications.forEach(id => handleDeleteNotification(id));
        }
        break;
      default:
        break;
    }
    setSelectedNotifications([]);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <MarkEmailReadIcon color="success" />;
      case 'error':
        return <EmailIcon color="error" />;
      case 'warning':
        return <EmailIcon color="warning" />;
      case 'info':
      default:
        return <EmailIcon color="info" />;
    }
  };
  
  // Filter chips
  const filterChips = [
    { label: 'All', value: null },
    { label: 'Unread', value: false },
    { label: 'Read', value: true },
  ];
  
  // Type filter options
  const typeOptions = [
    { label: 'All Types', value: null },
    { label: 'Info', value: 'info' },
    { label: 'Success', value: 'success' },
    { label: 'Warning', value: 'warning' },
    { label: 'Error', value: 'error' },
  ];
  
  // Sort options
  const sortOptions = [
    { label: 'Newest First', value: 'createdAt_desc' },
    { label: 'Oldest First', value: 'createdAt_asc' },
    { label: 'Type (A-Z)', value: 'type_asc' },
    { label: 'Type (Z-A)', value: 'type_desc' },
  ];
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: isMobile ? 1 : 3 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile && (
              <IconButton onClick={() => navigate(-1)}>
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography variant="h5" component="h1">
              Notifications
              {unreadCount > 0 && (
                <Chip 
                  label={`${unreadCount} unread`} 
                  color="primary" 
                  size="small" 
                  sx={{ ml: 2, fontWeight: 'bold' }}
                />
              )}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => dispatch(fetchNotifications({
                page: pagination.page,
                pageSize: pagination.pageSize,
                sortBy: sort.field,
                sortOrder: sort.order,
                ...filters,
              }))}
              disabled={loading}
            >
              Refresh
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<MarkEmailReadIcon />}
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || loading}
            >
              Mark All as Read
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleClearAll}
              disabled={notifications.length === 0 || loading}
            >
              Clear All
            </Button>
            
            <IconButton
              onClick={handleMenuOpen}
              aria-label="more"
              aria-controls="notifications-menu"
              aria-haspopup="true"
              disabled={loading}
            >
              <MoreVertIcon />
            </IconButton>
            
            <Menu
              id="notifications-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={() => { handleSortChange('createdAt'); handleMenuClose(); }}>
                <ListItemIcon>
                  <SortIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Sort</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { handleFilterChange({}); handleMenuClose(); }}>
                <ListItemIcon>
                  <FilterListIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Clear Filters</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        
        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200, flex: 1 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.read}
              onChange={(e) => handleFilterChange({ read: e.target.value })}
              label="Status"
            >
              <MenuItem value={null}>All Status</MenuItem>
              <MenuItem value={false}>Unread</MenuItem>
              <MenuItem value={true}>Read</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.type || ''}
              onChange={(e) => handleFilterChange({ type: e.target.value || null })}
              label="Type"
            >
              {typeOptions.map((option) => (
                <MenuItem key={option.value || 'all'} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <DateRangePicker
            startText="Start Date"
            endText="End Date"
            value={dateRange}
            onChange={(newValue) => setDateRange(newValue)}
            renderInput={(startProps, endProps) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField size="small" {...startProps} />
                <Box>to</Box>
                <TextField size="small" {...endProps} />
              </Box>
            )}
          />
        </Paper>
        
        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <Paper sx={{ p: 1, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="textSecondary">
              {selectedNotifications.length} selected
            </Typography>
            
            <Button
              size="small"
              startIcon={<MarkEmailReadIcon />}
              onClick={() => handleBulkAction('markAsRead')}
              disabled={loading}
            >
              Mark as Read
            </Button>
            
            <Button
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => handleBulkAction('delete')}
              disabled={loading}
            >
              Delete
            </Button>
            
            <Button
              size="small"
              onClick={() => setSelectedNotifications([])}
              sx={{ marginLeft: 'auto' }}
            >
              Clear Selection
            </Button>
          </Paper>
        )}
        
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Loading Indicator */}
        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}
        
        {/* Empty State */}
        {!loading && notifications.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <EmailIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No notifications found
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {Object.values(filters).some(Boolean) || searchQuery
                ? 'Try adjusting your filters or search query'
                : 'You\'re all caught up! New notifications will appear here.'}
            </Typography>
          </Paper>
        )}
        
        {/* Notifications List */}
        {!loading && notifications.length > 0 && (
          <Paper>
            <List disablePadding>
              {notifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem 
                    button 
                    onClick={() => handleNotificationClick(notification)}
                    selected={selectedNotifications.includes(notification.id)}
                    sx={{
                      backgroundColor: notification.read ? 'inherit' : 'action.hover',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                      borderLeft: `4px solid ${
                        notification.type === 'error' 
                          ? theme.palette.error.main 
                          : notification.type === 'success' 
                            ? theme.palette.success.main 
                            : notification.type === 'warning'
                              ? theme.palette.warning.main
                              : theme.palette.primary.main
                      }`,
                      pl: 2,
                      pr: 1,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleNotificationSelection(notification.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </ListItemIcon>
                    
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Typography 
                          variant="subtitle2" 
                          component="div"
                          sx={{
                            fontWeight: notification.read ? 'normal' : 'bold',
                          }}
                        >
                          {notification.title}
                          {!notification.read && (
                            <Chip 
                              label="Unread" 
                              size="small" 
                              color="primary" 
                              sx={{ ml: 1, height: 18, fontSize: '0.65rem' }}
                            />
                          )}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                            display="block"
                            sx={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            {formatDate(notification.timestamp)}
                          </Typography>
                        </>
                      }
                      sx={{ my: 0.5 }}
                    />
                    
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {!notification.read && (
                          <Tooltip title="Mark as read">
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              sx={{ mr: 0.5 }}
                            >
                              <MarkEmailReadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        <Tooltip title="Delete">
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
            
            {/* Pagination */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              p: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
              flexWrap: 'wrap',
              gap: 2,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Rows per page:
                </Typography>
                <Select
                  size="small"
                  value={pagination.pageSize}
                  onChange={handleRowsPerPageChange}
                  sx={{ height: 32 }}
                  disableUnderline
                >
                  {[5, 10, 25, 50].map((size) => (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  {`${(pagination.page - 1) * pagination.pageSize + 1}-${
                    Math.min(pagination.page * pagination.pageSize, pagination.total)
                  } of ${pagination.total}`}
                </Typography>
                
                <IconButton
                  onClick={(e) => handlePageChange(e, pagination.page - 2)}
                  disabled={pagination.page === 1 || loading}
                  size="small"
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
                
                <IconButton
                  onClick={(e) => handlePageChange(e, pagination.page)}
                  disabled={pagination.page * pagination.pageSize >= pagination.total || loading}
                  size="small"
                >
                  <ArrowBackIcon fontSize="small" sx={{ transform: 'rotate(180deg)' }} />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default NotificationsPage;
