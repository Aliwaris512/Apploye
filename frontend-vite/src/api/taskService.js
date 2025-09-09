import api from './api';

export const taskService = {
  // Get all tasks (with optional filters)
  getTasks: async (filters = {}) => {
    const params = new URLSearchParams();
    
    // Add filters to query params if provided
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await api.get(`/api/v1/tasks?${params.toString()}`);
    return response.data;
  },
  
  // Get single task
  getTask: async (taskId) => {
    const response = await api.get(`/api/v1/tasks/${taskId}`);
    return response.data;
  },
  
  // Create new task
  createTask: async (taskData) => {
    const response = await api.post('/api/v1/tasks', taskData);
    return response.data;
  },
  
  // Update task
  updateTask: async (taskId, taskData) => {
    const response = await api.put(`/api/v1/tasks/${taskId}`, taskData);
    return response.data;
  },
  
  // Delete task
  deleteTask: async (taskId) => {
    const response = await api.delete(`/api/v1/tasks/${taskId}`);
    return response.data;
  },
  
  // Update task status
  updateTaskStatus: async (taskId, status) => {
    const response = await api.patch(`/api/v1/tasks/${taskId}/status`, { status });
    return response.data;
  },
  
  // Assign task to user
  assignTask: async (taskId, userId) => {
    const response = await api.post(`/api/v1/tasks/${taskId}/assign`, { user_id: userId });
    return response.data;
  },
  
  // Get task comments
  getTaskComments: async (taskId) => {
    const response = await api.get(`/api/v1/tasks/${taskId}/comments`);
    return response.data;
  },
  
  // Add comment to task
  addComment: async (taskId, content) => {
    const response = await api.post(`/api/v1/tasks/${taskId}/comments`, { content });
    return response.data;
  }
};
