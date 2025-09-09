import api from './api';

const handleApiError = (error) => {
  console.error('API Error:', error);
  const errorMessage = error.response?.data?.detail || 
                     error.response?.data?.message || 
                     error.message || 
                     'An unexpected error occurred';
  throw new Error(errorMessage);
};

export const projectService = {
  // Get all projects with optional query parameters
  getProjects: async (params = {}) => {
    try {
      // Add cache-busting parameter if not already provided
      const requestParams = {
        ...params,
        _t: params._t || new Date().getTime()
      };
      // Try non-versioned route first
      try {
        const response = await api.get('/api/projects', { params: requestParams });
        return response.data;
      } catch (err) {
        const status = err.response?.status;
        if (status === 404 || status === 405) {
          // Fall back to v1 route
          const response2 = await api.get('/api/v1/projects', { params: requestParams });
          return response2.data;
        }
        throw err;
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // Safe empty list to keep UI functional
        return [];
      }
      return handleApiError(error);
    }
  },
  
  // Get single project by ID
  getProject: async (projectId) => {
    try {
      let response = await api.get(`/api/projects/${projectId}`);
      if (response.status === 404 || response.status === 405) {
        response = await api.get(`/api/v1/projects/${projectId}`);
      }
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Create new project
  createProject: async (projectData) => {
    try {
      let response = await api.post('/api/projects', projectData);
      if (response.status === 404 || response.status === 405) {
        response = await api.post('/api/v1/projects', projectData);
      }
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Update project
  updateProject: async ({ id, ...projectData }) => {
    try {
      let response = await api.put(`/api/projects/${id}`, projectData);
      if (response.status === 404 || response.status === 405) {
        response = await api.put(`/api/v1/projects/${id}`, projectData);
      }
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Delete project
  deleteProject: async (projectId) => {
    try {
      let response = await api.delete(`/api/projects/${projectId}`);
      if (response.status === 404 || response.status === 405) {
        response = await api.delete(`/api/v1/projects/${projectId}`);
      }
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Get project members
  getProjectMembers: async (projectId) => {
    try {
      const response = await api.get(`/api/v1/projects/${projectId}/members`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Add member to project
  addProjectMember: async (projectId, userId, role = 'member') => {
    try {
      const response = await api.post(`/api/v1/projects/${projectId}/members`, {
        user_id: userId,
        role
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Remove member from project
  removeProjectMember: async (projectId, userId) => {
    try {
      const response = await api.delete(`/api/v1/projects/${projectId}/members/${userId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Get project tasks with optional filters
  getProjectTasks: async (projectId, filters = {}) => {
    try {
      const response = await api.get(`/api/v1/projects/${projectId}/tasks`, { 
        params: filters 
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Create task in project
  createTask: async (projectId, taskData) => {
    try {
      const response = await api.post(`/api/v1/projects/${projectId}/tasks`, taskData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Update task status
  updateTaskStatus: async (projectId, taskId, status) => {
    try {
      const response = await api.patch(`/api/v1/projects/${projectId}/tasks/${taskId}/status`, {
        status
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Get project statistics
  getProjectStats: async (projectId) => {
    try {
      const response = await api.get(`/api/v1/projects/${projectId}/stats`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};
