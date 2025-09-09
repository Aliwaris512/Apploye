import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { timesheetService } from '../../api/timesheetService';

// Async thunks
export const startTracking = createAsyncThunk(
  'timesheet/startTracking',
  async ({ taskId, notes = '' }, { rejectWithValue }) => {
    try {
      const response = await timesheetService.startTracking(taskId, notes);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to start tracking');
    }
  }
);

export const stopTracking = createAsyncThunk(
  'timesheet/stopTracking',
  async (timeEntryId, { rejectWithValue }) => {
    try {
      const response = await timesheetService.stopTracking(timeEntryId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to stop tracking');
    }
  }
);

export const fetchTimesheetEntries = createAsyncThunk(
  'timesheet/fetchEntries',
  async ({ userId, startDate, endDate, ...params }, { rejectWithValue }) => {
    try {
      const response = await timesheetService.getTimesheetEntries(userId, startDate, endDate, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch timesheet entries');
    }
  }
);

export const addManualEntry = createAsyncThunk(
  'timesheet/addManualEntry',
  async (entryData, { rejectWithValue }) => {
    try {
      const response = await timesheetService.addManualEntry(entryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to add manual entry');
    }
  }
);

const timesheetSlice = createSlice({
  name: 'timesheet',
  initialState: {
    entries: [],
    currentEntry: null,
    loading: false,
    error: null,
    isTracking: false,
    activeTimer: null,
    dateRange: {
      startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
      endDate: new Date()
    }
  },
  reducers: {
    setCurrentEntry: (state, action) => {
      state.currentEntry = action.payload;
    },
    setDateRange: (state, action) => {
      state.dateRange = { ...state.dateRange, ...action.payload };
    },
    clearTimesheetError: (state) => {
      state.error = null;
    },
    resetTracking: (state) => {
      state.isTracking = false;
      state.activeTimer = null;
    }
  },
  extraReducers: (builder) => {
    // Start Tracking
    builder.addCase(startTracking.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(startTracking.fulfilled, (state, action) => {
      state.loading = false;
      state.isTracking = true;
      state.activeTimer = action.payload;
    });
    builder.addCase(startTracking.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Stop Tracking
    builder.addCase(stopTracking.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(stopTracking.fulfilled, (state) => {
      state.loading = false;
      state.isTracking = false;
      state.activeTimer = null;
    });
    builder.addCase(stopTracking.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch Timesheet Entries
    builder.addCase(fetchTimesheetEntries.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTimesheetEntries.fulfilled, (state, action) => {
      state.loading = false;
      state.entries = action.payload;
    });
    builder.addCase(fetchTimesheetEntries.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Add Manual Entry
    builder.addCase(addManualEntry.fulfilled, (state, action) => {
      state.entries.push(action.payload);
    });
  }
});

export const { 
  setCurrentEntry, 
  setDateRange, 
  clearTimesheetError, 
  resetTracking 
} = timesheetSlice.actions;

export const selectTimesheetEntries = (state) => state.timesheet.entries;
export const selectCurrentEntry = (state) => state.timesheet.currentEntry;
export const selectTimesheetLoading = (state) => state.timesheet.loading;
export const selectTimesheetError = (state) => state.timesheet.error;
export const selectIsTracking = (state) => state.timesheet.isTracking;
export const selectActiveTimer = (state) => state.timesheet.activeTimer;
export const selectDateRange = (state) => state.timesheet.dateRange;

export default timesheetSlice.reducer;
