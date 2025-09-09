import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { activityService } from '../../api/activityService';

// Async thunks
export const trackActivity = createAsyncThunk(
  'activity/track',
  async (activityData, { rejectWithValue }) => {
    try {
      const response = await activityService.trackActivity(activityData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to track activity');
    }
  }
);

export const trackAppUsage = createAsyncThunk(
  'activity/trackAppUsage',
  async (appData, { rejectWithValue }) => {
    try {
      const response = await activityService.trackAppUsage(appData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to track app usage');
    }
  }
);

export const uploadScreenshot = createAsyncThunk(
  'activity/uploadScreenshot',
  async ({ file, metadata = {} }, { rejectWithValue }) => {
    try {
      const response = await activityService.uploadScreenshot(file, metadata);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to upload screenshot');
    }
  }
);

export const fetchActivitySummary = createAsyncThunk(
  'activity/fetchSummary',
  async ({ userId, date, ...params }, { rejectWithValue }) => {
    try {
      const response = await activityService.getActivitySummary(userId, date, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch activity summary');
    }
  }
);

export const fetchActivityTimeline = createAsyncThunk(
  'activity/fetchTimeline',
  async ({ userId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await activityService.getActivityTimeline(userId, startDate, endDate);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch activity timeline');
    }
  }
);

const activitySlice = createSlice({
  name: 'activity',
  initialState: {
    currentActivity: null,
    timeline: [],
    summary: null,
    screenshots: [],
    loading: false,
    error: null,
    dateRange: {
      startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
      endDate: new Date()
    },
    filters: {
      type: 'all',
      user: 'all'
    }
  },
  reducers: {
    setActivityFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setDateRange: (state, action) => {
      state.dateRange = { ...state.dateRange, ...action.payload };
    },
    clearActivityError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Track Activity
    builder.addCase(trackActivity.fulfilled, (state, action) => {
      state.currentActivity = action.payload;
    });

    // Track App Usage
    builder.addCase(trackAppUsage.fulfilled, (state, action) => {
      // Update the current activity with app usage data
      if (state.currentActivity) {
        state.currentActivity.appUsage = action.payload;
      }
    });

    // Upload Screenshot
    builder.addCase(uploadScreenshot.fulfilled, (state, action) => {
      state.screenshots.unshift(action.payload);
    });

    // Fetch Activity Summary
    builder.addCase(fetchActivitySummary.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchActivitySummary.fulfilled, (state, action) => {
      state.loading = false;
      state.summary = action.payload;
    });
    builder.addCase(fetchActivitySummary.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch Activity Timeline
    builder.addCase(fetchActivityTimeline.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchActivityTimeline.fulfilled, (state, action) => {
      state.loading = false;
      state.timeline = action.payload;
    });
    builder.addCase(fetchActivityTimeline.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  }
});

export const { 
  setActivityFilters, 
  setDateRange, 
  clearActivityError 
} = activitySlice.actions;

export const selectCurrentActivity = (state) => state.activity.currentActivity;
export const selectActivityTimeline = (state) => state.activity.timeline;
export const selectActivitySummary = (state) => state.activity.summary;
export const selectScreenshots = (state) => state.activity.screenshots;
export const selectActivityLoading = (state) => state.activity.loading;
export const selectActivityError = (state) => state.activity.error;
export const selectActivityDateRange = (state) => state.activity.dateRange;
export const selectActivityFilters = (state) => state.activity.filters;

export default activitySlice.reducer;
