import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Async thunks
export const trackActivity = createAsyncThunk(
  'activity/track',
  async (activityData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(
        `${API_URL}/activity`, 
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
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(
        `${API_URL}/activity/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch activities');
    }
  }
);

export const getAllActivities = createAsyncThunk(
  'activity/getAllActivities',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(
        `${API_URL}/admin/activities`,
        {
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
