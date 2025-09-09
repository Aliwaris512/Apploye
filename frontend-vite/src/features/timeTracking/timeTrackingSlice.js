import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { timeTrackingService } from '../../api/timeTrackingService';

// Helper function to handle API errors
const handleApiError = (error) => {
  return error.message || 'An error occurred';
};

// Async thunks
export const fetchTimeEntries = createAsyncThunk(
  'timeTracking/fetchTimeEntries',
  async (params, { rejectWithValue }) => {
    try {
      const data = await timeTrackingService.getTimeEntries(params);
      return data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const startTimeEntry = createAsyncThunk(
  'timeTracking/startTimeEntry',
  async (entryData, { rejectWithValue }) => {
    try {
      const data = await timeTrackingService.startTimeEntry(entryData);
      return data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const stopTimeEntry = createAsyncThunk(
  'timeTracking/stopTimeEntry',
  async (entryId, { rejectWithValue }) => {
    try {
      const data = await timeTrackingService.stopTimeEntry(entryId);
      return data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const createTimeEntry = createAsyncThunk(
  'timeTracking/createTimeEntry',
  async (entryData, { rejectWithValue }) => {
    try {
      const data = await timeTrackingService.createTimeEntry(entryData);
      return data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateTimeEntry = createAsyncThunk(
  'timeTracking/updateTimeEntry',
  async ({ id, ...entryData }, { rejectWithValue }) => {
    try {
      const data = await timeTrackingService.updateTimeEntry(id, entryData);
      return data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteTimeEntry = createAsyncThunk(
  'timeTracking/deleteTimeEntry',
  async (entryId, { rejectWithValue }) => {
    try {
      await timeTrackingService.deleteTimeEntry(entryId);
      return entryId;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

const initialState = {
  items: [],
  currentEntry: null,
  loading: false,
  error: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
};

const timeTrackingSlice = createSlice({
  name: 'timeTracking',
  initialState,
  reducers: {
    setCurrentEntry: (state, action) => {
      state.currentEntry = action.payload;
    },
    clearTimeTrackingError: (state) => {
      state.error = null;
    },
    resetTimeTrackingState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Time Entries
      .addCase(fetchTimeEntries.pending, (state) => {
        state.loading = true;
        state.status = 'loading';
      })
      .addCase(fetchTimeEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTimeEntries.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Start Time Entry
      .addCase(startTimeEntry.pending, (state) => {
        state.loading = true;
        state.status = 'loading';
      })
      .addCase(startTimeEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'succeeded';
        state.currentEntry = action.payload;
      })
      .addCase(startTimeEntry.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Stop Time Entry
      .addCase(stopTimeEntry.pending, (state) => {
        state.loading = true;
        state.status = 'loading';
      })
      .addCase(stopTimeEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'succeeded';
        state.currentEntry = null;
        // Update the stopped entry in the items array
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(stopTimeEntry.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Create Time Entry
      .addCase(createTimeEntry.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      
      // Update Time Entry
      .addCase(updateTimeEntry.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      
      // Delete Time Entry
      .addCase(deleteTimeEntry.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  },
});

// Export actions
export const { 
  setCurrentEntry, 
  clearTimeTrackingError,
  resetTimeTrackingState 
} = timeTrackingSlice.actions;

// Export selectors
export const selectAllTimeEntries = (state) => state.timeTracking.items || [];
export const selectCurrentTimeEntry = (state) => state.timeTracking.currentEntry;
export const selectTimeTrackingLoading = (state) => state.timeTracking.loading;
export const selectTimeTrackingError = (state) => state.timeTracking.error;
export const selectTimeTrackingStatus = (state) => state.timeTracking.status;

export const selectTimeEntryById = (state, entryId) => {
  return state.timeTracking.items?.find(entry => entry.id === entryId) || null;
};

export const selectTimeEntriesByProject = createSelector(
  [selectAllTimeEntries, (state, projectId) => projectId],
  (entries, projectId) => {
    return entries.filter(entry => entry.projectId === projectId);
  }
);

export const selectTotalTimeByProject = createSelector(
  [selectAllTimeEntries, (state, projectId) => projectId],
  (entries, projectId) => {
    const projectEntries = entries.filter(entry => entry.projectId === projectId);
    return projectEntries.reduce((total, entry) => {
      return total + (entry.duration || 0);
    }, 0);
  }
);

export default timeTrackingSlice.reducer;
