import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

// Async thunks
export const trackActivity = createAsyncThunk(
  'activity/track',
  async (activityData, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/v1/activity/track`, 
        activityData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to track activity');
    }
  }
);

export const getUserActivities = createAsyncThunk(
  'activity/getUserActivities',
  async (period = 'today', { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      // Compute date range
      const today = new Date();
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const start = new Date(end);
      if (period === 'week') {
        start.setDate(end.getDate() - 6); // last 7 days including today
      }
      const toYMD = (d) => d.toISOString().slice(0, 10);

      const response = await axios.get(
        `${API_URL}/api/v1/activity/timeline`,
        {
          params: { start_date: toYMD(start), end_date: toYMD(end) },
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      // Map backend timeline to UI-friendly shape
      const data = Array.isArray(response.data) ? response.data.map(item => ({
        id: item.id,
        app: item.activity_data?.app_name || item.type,
        duration: item.duration,
        timestamp: item.start_time,
      })) : [];
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch activities');
    }
  }
);

export const getAllActivities = createAsyncThunk(
  'activity/getAllActivities',
  async (period = 'week', { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      // Default to last 7 days for aggregated stats
      const today = new Date();
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      const toYMD = (d) => d.toISOString().slice(0, 10);

      const response = await axios.get(
        `${API_URL}/api/v1/activity/stats/daily`,
        {
          params: { start_date: toYMD(start), end_date: toYMD(end) },
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch all activities');
    }
  }
);

const initialState = {
  activities: [],
  userActivities: [],
  loading: false,
  error: null,
  lastTracked: null,
};

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    clearActivityError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(trackActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(trackActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.lastTracked = action.payload;
      })
      .addCase(trackActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getUserActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.userActivities = action.payload;
      })
      .addCase(getUserActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(getAllActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearActivityError } = activitySlice.actions;

export const selectActivities = (state) => state.activity.activities;
export const selectUserActivities = (state) => state.activity.userActivities;
export const selectActivityLoading = (state) => state.activity.loading;
export const selectActivityError = (state) => state.activity.error;

export default activitySlice.reducer;
