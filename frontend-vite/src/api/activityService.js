import api from './api';
import { ACTIVITY_SUMMARY_PATH, ACTIVITY_TIMELINE_PATH, ACTIVITY_SUMMARY_V1_PATH, ACTIVITY_TIMELINE_V1_PATH } from './endpoints';

export const activityService = {
  // Track user activity
  trackActivity: async (activityData) => {
    const response = await api.post('/api/v1/activity/track', activityData);
    return response.data;
  },
  
  // Track app usage
  trackAppUsage: async (appData) => {
    const response = await api.post('/api/v1/activity/track/app-usage', appData);
    return response.data;
  },
  
  // Upload screenshot
  uploadScreenshot: async (file, metadata = {}) => {
    const formData = new FormData();
    formData.append('screenshot', file);
    
    // Add metadata if provided
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    
    const response = await api.post('/api/v1/activity/track/screenshot', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },
  
  // Get activity summary
  getActivitySummary: async (userId, date, params = {}) => {
    try {
      let response = await api.get(ACTIVITY_SUMMARY_PATH, {
        params: { user_id: userId, date, ...params }
      });
      // If not found or method not allowed, try v1 route
      if (response.status === 404 || response.status === 405) {
        response = await api.get(ACTIVITY_SUMMARY_V1_PATH, {
          params: { user_id: userId, date, ...params }
        });
      }
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        // Return safe mock so dashboard can render
        return {
          total_hours: 0,
          projects: [],
          date
        };
      }
      throw error;
    }
  },
  
  // Get activity timeline
  getActivityTimeline: async (userId, startDate, endDate) => {
    try {
      let response = await api.get(ACTIVITY_TIMELINE_PATH, {
        params: { user_id: userId, start_date: startDate, end_date: endDate }
      });
      if (response.status === 404 || response.status === 405) {
        response = await api.get(ACTIVITY_TIMELINE_V1_PATH, {
          params: { user_id: userId, start_date: startDate, end_date: endDate }
        });
      }
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },
  
  // Get daily stats
  getDailyStats: async (userId, date = new Date().toISOString().split('T')[0]) => {
    const response = await api.get('/api/v1/activity/stats/daily', {
      params: { user_id: userId, date }
    });
    return response.data;
  },
  
  // Get screenshots
  getScreenshots: async (userId, startDate, endDate, options = {}) => {
    const params = {
      user_id: userId,
      start_date: startDate,
      end_date: endDate,
      ...options
    };
    
    const response = await api.get('/api/v1/activity/screenshots', { params });
    return response.data;
  },
  
  // Get screenshot thumbnail URL
  getScreenshotThumbnailUrl: (screenshotId) => {
    return `${api.defaults.baseURL}/api/v1/activity/screenshots/${screenshotId}/thumbnail`;
  },
  
  // Get screenshot full URL
  getScreenshotUrl: (screenshotId) => {
    return `${api.defaults.baseURL}/api/v1/activity/screenshots/${screenshotId}`;
  },
  
  // Delete screenshot
  deleteScreenshot: async (screenshotId) => {
    const response = await api.delete(`/api/v1/activity/screenshots/${screenshotId}`);
    return response.data;
  }
};
