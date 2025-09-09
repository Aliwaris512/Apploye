import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { webSocketService } from '../services/websocketService';
import { 
  selectUnreadCount,
  addNotification,
  markAsRead,
  markAllAsRead as markAllAsReadAction,
  removeNotification,
  clearNotifications,
} from '../features/notifications/notificationsSlice';

/**
 * Custom hook to manage real-time notifications
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoMarkAsRead - Whether to automatically mark notifications as read when received
 * @param {boolean} options.showSnackbar - Whether to show a snackbar when a new notification is received
 * @returns {Object} - Notification state and methods
 */
const useRealtimeNotifications = (options = {}) => {
  const {
    autoMarkAsRead = false,
    showSnackbar = true,
  } = options;

  const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const unreadCount = useSelector(selectUnreadCount);
  const [isConnected, setIsConnected] = useState(webSocketService.isConnected);
  const [error, setError] = useState(null);

  // Handle new notifications
  const handleNewNotification = useCallback((notification) => {
    try {
      // Add notification to the store
      dispatch(addNotification(notification));

      // Show snackbar if enabled
      if (showSnackbar) {
        const action = (key) => (
          <>
            <button 
              onClick={() => {
                closeSnackbar(key);
                // Handle notification click (e.g., navigate to the relevant page)
                if (notification.link) {
                  window.location.href = notification.link;
                }
              }}
              style={{ color: '#fff', marginLeft: '8px' }}
            >
              View
            </button>
          </>
        );

        enqueueSnackbar(notification.message, {
          variant: notification.type || 'info',
          action,
          autoHideDuration: 5000,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        });
      }

      // Mark as read if autoMarkAsRead is enabled
      if (autoMarkAsRead) {
        dispatch(markAsRead(notification.id));
      }
    } catch (err) {
      console.error('Error handling notification:', err);
      setError(err);
    }
  }, [autoMarkAsRead, showSnackbar, dispatch, enqueueSnackbar, closeSnackbar]);

  // Set up WebSocket connection and subscription
  useEffect(() => {
    // Connect to WebSocket if not already connected
    if (!isConnected) {
      webSocketService.connect();
    }

    // Subscribe to notifications channel
    const unsubscribe = webSocketService.subscribe('notifications', handleNewNotification);

    // Set up connection state listeners
    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
      
      // Resubscribe on reconnect
      webSocketService.subscribe('notifications', handleNewNotification);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setError(new Error('Disconnected from notification service'));
    };

    const cleanupConnect = webSocketService.onConnect(handleConnect);
    const cleanupDisconnect = webSocketService.onDisconnect(handleDisconnect);

    // Clean up on unmount
    return () => {
      unsubscribe();
      cleanupConnect();
      cleanupDisconnect();
    };
  }, [handleNewNotification, isConnected]);

  // Mark a notification as read
  const markAsReadHandler = useCallback((notificationId) => {
    dispatch(markAsRead(notificationId));
  }, [dispatch]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    dispatch(markAllAsReadAction());
  }, [dispatch]);

  // Remove a notification
  const removeNotificationHandler = useCallback((notificationId) => {
    dispatch(removeNotification(notificationId));
  }, [dispatch]);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  return {
    // State
    isConnected,
    error,
    unreadCount,
    
    // Methods
    markAsRead: markAsReadHandler,
    markAllAsRead,
    removeNotification: removeNotificationHandler,
    clearAllNotifications,
  };
};

export default useRealtimeNotifications;
