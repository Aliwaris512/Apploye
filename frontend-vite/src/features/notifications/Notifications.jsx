import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, List, ListItem,
  ListItemText, ListItemAvatar, Avatar, IconButton, Badge,
  Divider, Chip, Tabs, Tab, Menu, MenuItem, Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  MoreVert as MoreVertIcon,
  MarkEmailRead as MarkEmailReadIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  FilterList as FilterListIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  MarkAsUnread as MarkAsUnreadIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

// Sample notifications data
const sampleNotifications = [
  {
    id: 1,
    title: 'New project assigned',
    message: 'You have been assigned to the new website redesign project.',
    type: 'info',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    action: '/projects/123'
  },
  {
    id: 2,
    title: 'Task deadline approaching',
    message: 'The deadline for "Complete homepage mockups" is in 2 days.',
    type: 'warning',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    action: '/tasks/456'
  },
  {
    id: 3,
    title: 'New message from John',
    message: 'Hey, do you have a minute to discuss the project?',
    type: 'message',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    action: '/messages/789'
  },
  {
    id: 4,
    title: 'Time tracking reminder',
    message: 'Don\'t forget to submit your timesheet for this week.',
    type: 'reminder',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    action: '/timesheet'
  },
  {
    id: 5,
    title: 'System update available',
    message: 'A new version of the application is available. Please update when convenient.',
    type: 'system',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    action: '/settings/updates'
  }
];

const Notifications = () => {
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [activeTab, setActiveTab] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    return notification.type === activeTab;
  });

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle filter menu open
  const handleFilterMenuOpen = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setFilterAnchorEl(null);
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    handleMenuClose();
  };

  // Mark as read
  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  // Mark as unread
  const handleMarkAsUnread = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: false } : n
    ));
  };

  // Delete notification
  const handleDelete = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // Delete all notifications
  const handleDeleteAll = () => {
    setNotifications([]);
    handleMenuClose();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info':
        return <InfoIcon color="info" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'message':
        return <MarkEmailReadIcon color="primary" />;
      default:
        return <NotificationsIcon color="action" />;
    }
  };

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h6" component="h2">
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {unreadCount > 0 
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up!'
            }
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh">
            <IconButton>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Filter">
            <IconButton onClick={handleFilterMenuOpen}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<NotificationsActiveIcon />}
            aria-controls="notification-menu"
            aria-haspopup="true"
            onClick={handleMenuOpen}
          >
            Actions
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="notification tabs"
        >
          <Tab 
            iconPosition="start"
            icon={
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <NotificationsIcon />
              </Badge>
            } 
            label="All" 
            value="all" 
          />
          <Tab 
            iconPosition="start"
            icon={
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <MarkAsUnreadIcon />
              </Badge>
            } 
            label="Unread" 
            value="unread" 
          />
          <Tab icon={<InfoIcon />} label="Info" value="info" />
          <Tab icon={<WarningIcon />} label="Warnings" value="warning" />
          <Tab icon={<MarkEmailReadIcon />} label="Messages" value="message" />
          <Tab icon={<NotificationsIcon />} label="System" value="system" />
        </Tabs>
      </Card>

      {/* Notifications List */}
      <Card>
        {filteredNotifications.length > 0 ? (
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem 
                  alignItems="flex-start"
                  secondaryAction={
                    <Box display="flex" alignItems="center">
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </Typography>
                      <IconButton 
                        edge="end" 
                        aria-label="more"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNotification(notification);
                          handleMenuOpen(e);
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  }
                  sx={{
                    bgcolor: notification.read ? 'inherit' : 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    handleMarkAsRead(notification.id);
                    // In a real app, navigate to the notification action
                    console.log('Navigating to:', notification.action);
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      color="error"
                      variant="dot"
                      invisible={notification.read}
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                      }}
                    >
                      <Avatar sx={{ bgcolor: 'transparent' }}>
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography 
                          component="span" 
                          variant="subtitle2" 
                          color="text.primary"
                          sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}
                        >
                          {notification.title}
                        </Typography>
                        <Chip 
                          label={notification.type} 
                          size="small" 
                          sx={{ ml: 1, height: 20, fontSize: '0.65rem' }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {notification.message}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < filteredNotifications.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box p={4} textAlign="center">
            <NotificationsOffIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No notifications found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {activeTab === 'all' 
                ? 'You have no notifications yet.' 
                : `You have no ${activeTab} notifications.`
              }
            </Typography>
          </Box>
        )}
      </Card>

      {/* Actions Menu */}
      <Menu
        id="notification-actions-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification ? (
          [
            <MenuItem 
              key="mark-read" 
              onClick={() => {
                handleMarkAsRead(selectedNotification.id);
                handleMenuClose();
              }}
              disabled={selectedNotification.read}
            >
              <CheckCircleIcon sx={{ mr: 1 }} />
              Mark as read
            </MenuItem>,
            <MenuItem 
              key="mark-unread" 
              onClick={() => {
                handleMarkAsUnread(selectedNotification.id);
                handleMenuClose();
              }}
              disabled={!selectedNotification.read}
            >
              <MarkAsUnreadIcon sx={{ mr: 1 }} />
              Mark as unread
            </MenuItem>,
            <Divider key="divider" />,
            <MenuItem 
              key="delete" 
              onClick={() => {
                handleDelete(selectedNotification.id);
                handleMenuClose();
              }}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          ]
        ) : (
          [
            <MenuItem key="mark-all-read" onClick={handleMarkAllAsRead}>
              <CheckCircleIcon sx={{ mr: 1 }} />
              Mark all as read
            </MenuItem>,
            <MenuItem key="delete-all" onClick={handleDeleteAll} sx={{ color: 'error.main' }}>
              <DeleteIcon sx={{ mr: 1 }} />
              Delete all notifications
            </MenuItem>
          ]
        )}
      </Menu>

      {/* Filter Menu */}
      <Menu
        id="filter-menu"
        anchorEl={filterAnchorEl}
        keepMounted
        open={Boolean(filterAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { setActiveTab('all'); handleMenuClose(); }}>
          All Notifications
        </MenuItem>
        <MenuItem onClick={() => { setActiveTab('unread'); handleMenuClose(); }}>
          Unread Only
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setActiveTab('info'); handleMenuClose(); }}>
          Information
        </MenuItem>
        <MenuItem onClick={() => { setActiveTab('warning'); handleMenuClose(); }}>
          Warnings
        </MenuItem>
        <MenuItem onClick={() => { setActiveTab('message'); handleMenuClose(); }}>
          Messages
        </MenuItem>
        <MenuItem onClick={() => { setActiveTab('system'); handleMenuClose(); }}>
          System Updates
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Notifications;
