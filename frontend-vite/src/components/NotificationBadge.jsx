import React, { useState, useRef, useEffect } from 'react';
import { Badge, IconButton, Popover, Box, Typography, List, ListItem, ListItemText, ListItemIcon, Button, Divider, Tooltip } from '@mui/material';
import { Notifications as NotificationsIcon, NotificationsNone as NotificationsNoneIcon, Close as CloseIcon, MarkEmailRead as MarkEmailReadIcon, Email as EmailIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { formatDistanceToNow } from 'date-fns';

const NotificationBadge = ({ maxNotifications = 10, showMarkAll = true, showClearAll = true }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const notificationsEndRef = useRef(null);
  
  const {
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    isConnected,
    error,
  } = useRealtimeNotifications({
    autoMarkAsRead: false,
    showSnackbar: true,
  });

  // Sample notifications - replace with actual data from your store
  const [notifications, setNotifications] = useState([
    { 
      id: '1', 
      title: 'New Project Assigned', 
      message: 'You have been assigned to the new project',
      type: 'info',
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      link: '/projects/123'
    },
    { 
      id: '2', 
      title: 'Task Due Soon', 
      message: 'Task "Complete dashboard UI" is due in 2 days',
      type: 'warning',
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      link: '/tasks/456'
    },
    { 
      id: '3', 
      title: 'New Message', 
      message: 'You have a new message from John Doe',
      type: 'info',
      read: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      link: '/messages/789'
    },
  ]);

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);
  const displayNotifications = [
    ...unreadNotifications,
    ...readNotifications
  ].slice(0, maxNotifications);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.link) {
      window.location.href = notification.link;
    }
    
    handleClose();
  };

  const handleMarkAsRead = (notificationId, event) => {
    event.stopPropagation();
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    clearAllNotifications();
  };

  const handleRemoveNotification = (notificationId, event) => {
    event.stopPropagation();
    removeNotification(notificationId);
  };

  // Auto-scroll to bottom when notifications change
  useEffect(() => {
    if (notificationsEndRef.current) {
      notificationsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayNotifications]);

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton 
          color="inherit" 
          onClick={handleClick}
          aria-describedby={id}
          aria-label={`show ${unreadCount} new notifications`}
        >
          <Badge 
            badgeContent={unreadCount} 
            color="error"
            invisible={unreadCount === 0}
          >
            {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsNoneIcon />}
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          style: {
            width: '350px',
            maxHeight: '80vh',
            overflow: 'auto',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle1" component="div">
            Notifications
          </Typography>
          <Box>
            {showMarkAll && unreadCount > 0 && (
              <Button 
                size="small" 
                onClick={handleMarkAllAsRead}
                startIcon={<MarkEmailReadIcon />}
                sx={{ mr: 1 }}
              >
                Mark all as read
              </Button>
            )}
            {showClearAll && notifications.length > 0 && (
              <Button 
                size="small" 
                onClick={handleClearAll}
                color="error"
                startIcon={<CloseIcon />}
              >
                Clear all
              </Button>
            )}
          </Box>
        </Box>
        
        {!isConnected && (
          <Box sx={{ p: 2, textAlign: 'center', color: theme.palette.error.main }}>
            <Typography variant="body2">
              {error ? `Connection error: ${error.message}` : 'Connecting to notification service...'}
            </Typography>
          </Box>
        )}
        
        {isConnected && displayNotifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <EmailIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications to display
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {displayNotifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem 
                  button 
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    backgroundColor: notification.read ? 'transparent' : 'action.hover',
                    '&:hover': {
                      backgroundColor: theme.palette.action.selected,
                    },
                    borderLeft: `3px solid ${
                      notification.type === 'error' 
                        ? theme.palette.error.main 
                        : notification.type === 'success' 
                          ? theme.palette.success.main 
                          : theme.palette.primary.main
                    }`,
                    pl: 1.5,
                  }}
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      size="small" 
                      onClick={(e) => handleRemoveNotification(notification.id, e)}
                      aria-label="delete"
                      sx={{
                        '&:hover': {
                          color: theme.palette.error.main,
                        },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {notification.read ? (
                      <MarkEmailReadIcon color="disabled" fontSize="small" />
                    ) : (
                      <EmailIcon color="primary" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" component="div">
                        {notification.title}
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
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </Typography>
                      </>
                    }
                    sx={{ my: 0 }}
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
            <div ref={notificationsEndRef} />
          </List>
        )}
        
        {displayNotifications.length > 0 && (
          <Box sx={{ p: 1, textAlign: 'center', borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button 
              size="small" 
              fullWidth 
              href="/notifications" 
              onClick={handleClose}
            >
              View All Notifications
            </Button>
          </Box>
        )}
      </Popover>
    </>
  );
};

export default NotificationBadge;
