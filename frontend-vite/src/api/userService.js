import api from './api';

export const userService = {
  // Get all users (admin only)
  getUsers: async () => {
    const response = await api.get('/api/v1/admin/users');
    return response.data;
  },
  
  // Create a new user (admin only)
  createUser: async (userData) => {
    const response = await api.post('/api/v1/admin/users', userData);
    return response.data;
  },
  
  // Update user (admin only)
  updateUser: async (userId, userData) => {
    const response = await api.put(`/api/v1/admin/users/${userId}`, userData);
    return response.data;
  },
  
  // Delete user (admin only)
  deleteUser: async (userId) => {
    const response = await api.delete(`/api/v1/admin/users/${userId}`);
    return response.data;
  },
  
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/api/v1/users/me');
    return response.data;
  },
  
  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('/api/v1/users/me', userData);
    return response.data;
  },
  
  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/api/v1/users/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    });
    return response.data;
  }
};
