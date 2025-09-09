import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import monitoringService from './monitoringService';

// Initial state
const initialState = {
  activities: [],
  screenshots: [],
  activityStats: {},
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Async thunks
export const fetchActivities = createAsyncThunk(
  'monitoring/fetchActivities',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await monitoringService.getActivities(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activities');
    }
  }
);

export const fetchScreenshots = createAsyncThunk(
  'monitoring/fetchScreenshots',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await monitoringService.getScreenshots(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch screenshots');
    }
  }
);

export const fetchActivityStats = createAsyncThunk(
  'monitoring/fetchActivityStats',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await monitoringService.getActivityStats(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activity stats');
    }
  }
);

// Slice
const monitoringSlice = createSlice({
  name: 'monitoring',
  initialState,
  reducers: {
    clearMonitoringError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Activities
    builder
      .addCase(fetchActivities.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.activities = action.payload;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch Screenshots
      .addCase(fetchScreenshots.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchScreenshots.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.screenshots = action.payload;
      })
      .addCase(fetchScreenshots.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch Activity Stats
      .addCase(fetchActivityStats.fulfilled, (state, action) => {
        state.activityStats = action.payload;
      });
  },
});

// Export actions
export const { clearMonitoringError } = monitoringSlice.actions;

// Export selectors
export const selectAllActivities = (state) => state.monitoring.activities;
export const selectAllScreenshots = (state) => state.monitoring.screenshots;
export const selectActivityStats = (state) => state.monitoring.activityStats;
export const selectMonitoringStatus = (state) => state.monitoring.status;
export const selectMonitoringError = (state) => state.monitoring.error;

export default monitoringSlice.reducer;
