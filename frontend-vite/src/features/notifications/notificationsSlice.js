import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationsAPI } from '../../api/apiService';
import { handleApiError } from '../../utils/apiErrorHandler';

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.markAsRead(notificationId);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.markAllAsRead();
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationsAPI.delete(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const clearAllNotifications = createAsyncThunk(
  'notifications/clearAll',
  async (_, { rejectWithValue }) => {
    try {
      await notificationsAPI.clearAll();
      return [];
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  lastFetched: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  },
  filters: {
    read: null,
    type: null,
    dateRange: null,
  },
  sort: {
    field: 'createdAt',
    order: 'desc',
  },
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Add a new notification (for real-time updates)
    addNotification: (state, action) => {
      const notification = action.payload;
      // Check if notification already exists to prevent duplicates
      const exists = state.notifications.some(n => n.id === notification.id);
      if (!exists) {
        state.notifications.unshift(notification);
        state.unreadCount += 1;
        
        // Ensure we don't exceed the page size
        if (state.notifications.length > state.pagination.pageSize) {
          state.notifications.pop();
        }
      }
    },
    
    // Mark a notification as read (optimistic update)
    markAsRead: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    
    // Mark all notifications as read (optimistic update)
    markAllAsRead: (state) => {
      state.notifications = state.notifications.map(notification => ({
        ...notification,
        read: true,
      }));
      state.unreadCount = 0;
    },
    
    // Remove a notification (optimistic update)
    removeNotification: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification) {
        state.notifications = state.notifications.filter(n => n.id !== notificationId);
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },
    
    // Clear all notifications (optimistic update)
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    
    // Update filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    
    // Update sort
    setSort: (state, action) => {
      state.sort = { ...state.sort, ...action.payload };
    },
    
    // Update pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    // Reset state
    resetNotifications: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch Notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data || [];
        state.unreadCount = action.payload.unreadCount || 0;
        state.pagination = {
          ...state.pagination,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 1,
        };
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch notifications';
      });
      
    // Mark as Read
    builder
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        // The optimistic update in the reducer handles the UI update
        // This just ensures we don't have any errors
        state.error = null;
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        // Revert optimistic update on error
        const notificationId = action.meta.arg;
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read = false;
          state.unreadCount += 1;
        }
        state.error = action.payload || 'Failed to mark notification as read';
      });
      
    // Mark All as Read
    builder
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        // The optimistic update in the reducer handles the UI update
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        // Revert optimistic update on error
        state.notifications = state.notifications.map(notification => ({
          ...notification,
          read: false,
        }));
        state.unreadCount = state.notifications.filter(n => !n.read).length;
        state.error = action.payload || 'Failed to mark all notifications as read';
      });
      
    // Delete Notification
    builder
      .addCase(deleteNotification.fulfilled, (state) => {
        // The optimistic update in the reducer handles the UI update
        state.error = null;
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        // Re-adding the notification would be complex, so we just show an error
        state.error = action.payload || 'Failed to delete notification';
      });
      
    // Clear All Notifications
    builder
      .addCase(clearAllNotifications.fulfilled, (state) => {
        // The optimistic update in the reducer handles the UI update
        state.error = null;
      })
      .addCase(clearAllNotifications.rejected, (state, action) => {
        // We can't easily restore all notifications, so we just show an error
        state.error = action.payload || 'Failed to clear all notifications';
      });
  },
});

// Export actions
export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearNotifications,
  setFilters,
  setSort,
  setPagination,
  resetNotifications,
} = notificationsSlice.actions;

// Selectors
export const selectAllNotifications = (state) => state.notifications.notifications;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationsLoading = (state) => state.notifications.loading;
export const selectNotificationsError = (state) => state.notifications.error;
export const selectNotificationsPagination = (state) => state.notifications.pagination;
export const selectNotificationsFilters = (state) => state.notifications.filters;
export const selectNotificationsSort = (state) => state.notifications.sort;

// Reducer
export default notificationsSlice.reducer;
