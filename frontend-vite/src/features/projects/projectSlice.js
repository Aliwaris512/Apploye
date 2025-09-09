import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { projectService } from '../../api/projectService';

// Helper function to handle API errors
const handleApiError = (error) => {
  return error.message || 'An error occurred';
};

// Async thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (params, { rejectWithValue }) => {
    try {
      const data = await projectService.getProjects(params);
      return data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const data = await projectService.createProject(projectData);
      return data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const data = await projectService.updateProject(projectData);
      return data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (projectId, { rejectWithValue }) => {
    try {
      await projectService.deleteProject(projectId);
      return projectId;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    items: [],
    currentProject: null,
    loading: false,
    error: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  },
  reducers: {
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    clearProjectError: (state) => {
      state.error = null;
    },
    resetProjectsState: () => {
      return { ...initialState };
    }
  },
  extraReducers: (builder) => {
    // Fetch Projects
    builder.addCase(fetchProjects.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProjects.fulfilled, (state, action) => {
      state.loading = false;
      const payload = action.payload;
      // Support both array responses and paginated objects { items, total, ... }
      if (Array.isArray(payload)) {
        state.items = payload;
      } else if (payload && Array.isArray(payload.items)) {
        state.items = payload.items;
      } else {
        state.items = [];
      }
    });
    builder.addCase(fetchProjects.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Create Project
    builder.addCase(createProject.fulfilled, (state, action) => {
      state.items.push(action.payload);
    });

    // Update Project
    builder.addCase(updateProject.fulfilled, (state, action) => {
      const index = state.items.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.currentProject?.id === action.payload.id) {
        state.currentProject = action.payload;
      }
    });

    // Delete Project
    builder.addCase(deleteProject.fulfilled, (state, action) => {
      state.items = state.items.filter(project => project.id !== action.payload);
      if (state.currentProject?.id === action.payload) {
        state.currentProject = null;
      }
    });
  }
});

// Export actions
export const { 
  setCurrentProject, 
  clearProjectError,
  resetProjectsState 
} = projectSlice.actions;

// Export selectors
export const selectAllProjects = (state) => state.projects.items || [];
export const selectProjects = (state) => state.projects.items;
export const selectCurrentProject = (state) => state.projects.currentProject;
export const selectProjectsLoading = (state) => state.projects.loading;
export const selectProjectsError = (state) => state.projects.error;
export const selectProjectsStatus = (state) => state.projects.status;

export const selectProjectById = (state, projectId) => {
  return state.projects.items?.find(project => project.id === projectId) || null;
};

export default projectSlice.reducer;
