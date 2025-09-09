import api from './api';

export const timesheetService = {
  // Start time tracking
  startTracking: async (taskId, notes = '') => {
    const response = await api.post('/api/v1/timesheet/start', {
      task_id: taskId,
      notes
    });
    return response.data;
  },
  
  // Stop time tracking
  stopTracking: async (timeEntryId) => {
    const response = await api.post(`/api/v1/timesheet/stop/${timeEntryId}`);
    return response.data;
  },
  
  // Get timesheet entries
  getTimesheetEntries: async (userId, startDate, endDate, params = {}) => {
    const response = await api.get('/api/timesheet/entries', {
      params: {
        user_id: userId,
        start_date: startDate,
        end_date: endDate,
        ...params // Include any additional params like _t for cache busting
      }
    });
    return response.data || [];
  },
  
  // Get timesheet summary
  getTimesheetSummary: async (userId, period = 'week', date = new Date().toISOString().split('T')[0]) => {
    const response = await api.get('/api/v1/timesheet/summary', {
      params: {
        user_id: userId,
        period,
        date
      }
    });
    return response.data;
  },
  
  // Add manual time entry
  addManualEntry: async (entryData) => {
    const response = await api.post('/api/v1/timesheet/manual', entryData);
    return response.data;
  },
  
  // Update time entry
  updateTimeEntry: async (entryId, entryData) => {
    const response = await api.put(`/api/v1/timesheet/entries/${entryId}`, entryData);
    return response.data;
  },
  
  // Delete time entry
  deleteTimeEntry: async (entryId) => {
    const response = await api.delete(`/api/v1/timesheet/entries/${entryId}`);
    return response.data;
  },
  
  // Get attendance records
  getAttendance: async (userId, startDate, endDate) => {
    const response = await api.get('/api/v1/attendance', {
      params: {
        user_id: userId,
        start_date: startDate,
        end_date: endDate
      }
    });
    return response.data;
  },
  
  // Mark attendance
  markAttendance: async (userId, date, status, notes = '') => {
    const response = await api.post('/api/v1/attendance', {
      user_id: userId,
      date,
      status,
      notes
    });
    return response.data;
  }
};
