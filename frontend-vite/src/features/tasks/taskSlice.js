import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskService } from '../../api/taskService';

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await taskService.getTasks(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch tasks');
    }
  }
);

export const fetchProjectTasks = createAsyncThunk(
  'tasks/fetchProjectTasks',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await taskService.getTasks({ project: projectId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch project tasks');
    }
  }
);

export const fetchTask = createAsyncThunk(
  'tasks/fetchTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await taskService.getTask(taskId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch task');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await taskService.createTask(taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, taskData }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateTask(taskId, taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      await taskService.deleteTask(taskId);
      return taskId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete task');
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateTaskStatus',
  async ({ taskId, status }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateTaskStatus(taskId, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update task status');
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    currentTask: null,
    loading: false,
    error: null,
    filters: {
      status: '',
      priority: '',
      assignee: ''
    }
  },
  reducers: {
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    setTaskFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearTaskError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch Tasks
    builder.addCase(fetchTasks.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      state.loading = false;
      state.tasks = action.payload;
    });
    builder.addCase(fetchTasks.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch Single Task
    builder.addCase(fetchTask.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTask.fulfilled, (state, action) => {
      state.loading = false;
      state.currentTask = action.payload;
    });
    builder.addCase(fetchTask.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Create Task
    builder.addCase(createTask.fulfilled, (state, action) => {
      state.tasks.push(action.payload);
    });

    // Update Task
    builder.addCase(updateTask.fulfilled, (state, action) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      if (state.currentTask?.id === action.payload.id) {
        state.currentTask = action.payload;
      }
    });

    // Delete Task
    builder.addCase(deleteTask.fulfilled, (state, action) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
      if (state.currentTask?.id === action.payload) {
        state.currentTask = null;
      }
    });

    // Update Task Status
    builder.addCase(updateTaskStatus.fulfilled, (state, action) => {
      const task = state.tasks.find(t => t.id === action.payload.id);
      if (task) {
        task.status = action.payload.status;
      }
      if (state.currentTask?.id === action.payload.id) {
        state.currentTask.status = action.payload.status;
      }
    });
  }
});

export const { setCurrentTask, setTaskFilters, clearTaskError } = taskSlice.actions;

export const selectTasks = (state) => state.tasks.tasks;
export const selectCurrentTask = (state) => state.tasks.currentTask;
export const selectTasksLoading = (state) => state.tasks.loading;
export const selectTasksError = (state) => state.tasks.error;
export const selectTaskFilters = (state) => state.tasks.filters;

export default taskSlice.reducer;
