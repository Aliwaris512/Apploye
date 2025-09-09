import api from './api';

const handleApiError = (error) => {
  console.error('API Error:', error);
  const errorMessage = error.response?.data?.detail || 
                     error.response?.data?.message || 
                     error.message || 
                     'An unexpected error occurred';
  throw new Error(errorMessage);
};

export const timeTrackingService = {
  // Get all time entries with optional query parameters
  getTimeEntries: async (params = {}) => {
    try {
      // Build defaults: last 7 days for the current user
      const user = (() => {
        try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; }
      })();
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - 7);

      const query = {
        user_id: params.user_id || user?.id || '1',
        start_date: params.start_date || start.toISOString().slice(0,10),
        end_date: params.end_date || today.toISOString().slice(0,10),
        _t: params._t || new Date().getTime(),
      };

      // Try non-versioned route first
      try {
        const response = await api.get('/api/timesheet/entries', { params: query });
        return response.data;
      } catch (err) {
        const status = err.response?.status;
        if (status === 404 || status === 405) {
          // Fall back to v1 time-entries listing
          const response2 = await api.get('/api/v1/time-entries', { params: query });
          return response2.data;
        }
        throw err;
      }
    } catch (error) {
      if (error.response?.status === 404) {
        return [];
      }
      return handleApiError(error);
    }
  },
  
  // Get current running time entry (if any)
  getCurrentTimeEntry: async () => {
    try {
      const response = await api.get('/api/v1/time-entries/current');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // No running time entry
      }
      return handleApiError(error);
    }
  },
  
  // Start a new time entry
  startTimeEntry: async (entryData) => {
    try {
      const response = await api.post('/api/v1/time-entries/start', entryData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Stop the current time entry
  stopTimeEntry: async (entryId) => {
    try {
      const response = await api.post(`/api/v1/time-entries/${entryId}/stop`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Create a manual time entry
  createTimeEntry: async (entryData) => {
    try {
      const response = await api.post('/api/v1/time-entries', entryData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Update a time entry
  updateTimeEntry: async (entryId, entryData) => {
    try {
      const response = await api.put(`/api/v1/time-entries/${entryId}`, entryData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Delete a time entry
  deleteTimeEntry: async (entryId) => {
    try {
      await api.delete(`/api/v1/time-entries/${entryId}`);
      return entryId;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Get time entries summary (for reports)
  getTimeSummary: async (params = {}) => {
    try {
      const response = await api.get('/api/v1/time-entries/summary', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Get time entries by project
  getTimeEntriesByProject: async (projectId, params = {}) => {
    try {
      const response = await api.get(`/api/v1/projects/${projectId}/time-entries`, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Get time entries by user
  getTimeEntriesByUser: async (userId, params = {}) => {
    try {
      const response = await api.get(`/api/v1/users/${userId}/time-entries`, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};
