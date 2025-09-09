import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

// Async thunks
export const startTimer = createAsyncThunk(
  'timeTracker/startTimer',
  async ({ projectId, taskId = null, description = '' }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/time-entries/start`,
        { project_id: projectId, task_id: taskId, description },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to start timer');
    }
  }
);

export const pauseTimer = createAsyncThunk(
  'timeTracker/pauseTimer',
  async (timeEntryId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/time-entries/${timeEntryId}/pause`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to pause timer');
    }
  }
);

export const stopTimer = createAsyncThunk(
  'timeTracker/stopTimer',
  async (timeEntryId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/time-entries/${timeEntryId}/stop`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to stop timer');
    }
  }
);

export const fetchActiveTimer = createAsyncThunk(
  'timeTracker/fetchActiveTimer',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/time-entries/active`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // No active timer
      }
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch active timer');
    }
  }
);

// Slice
const timeTrackerSlice = createSlice({
  name: 'timeTracker',
  initialState: {
    activeTimer: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Start Timer
    builder.addCase(startTimer.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(startTimer.fulfilled, (state, action) => {
      state.loading = false;
      state.activeTimer = action.payload;
    });
    builder.addCase(startTimer.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    
    // Pause Timer
    builder.addCase(pauseTimer.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(pauseTimer.fulfilled, (state, action) => {
      state.loading = false;
      state.activeTimer = action.payload;
    });
    builder.addCase(pauseTimer.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    
    // Stop Timer
    builder.addCase(stopTimer.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(stopTimer.fulfilled, (state) => {
      state.loading = false;
      state.activeTimer = null;
    });
    builder.addCase(stopTimer.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    
    // Fetch Active Timer
    builder.addCase(fetchActiveTimer.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchActiveTimer.fulfilled, (state, action) => {
      state.loading = false;
      state.activeTimer = action.payload;
    });
    builder.addCase(fetchActiveTimer.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.activeTimer = null;
    });
  },
});

export const { clearError } = timeTrackerSlice.actions;

export const selectActiveTimer = (state) => state.timeTracker.activeTimer;
export const selectTimeTrackerLoading = (state) => state.timeTracker.loading;
export const selectTimeTrackerError = (state) => state.timeTracker.error;

export default timeTrackerSlice.reducer;
