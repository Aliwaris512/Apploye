import api from '../api/api';

// Register user
const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

// Login user
const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (response.data?.access_token) {
      localStorage.setItem('token', response.data.access_token);
      
      // The backend returns user data along with the token
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.user;
      }
      
      // Fallback: If user data isn't in the response, fetch it
      try {
        const userResponse = await api.get('/auth/me');
        const userData = userResponse.data;
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        // Return minimal user data if we can't fetch full profile
        return { email };
      }
    }
    
    throw new Error('No access token received');
  } catch (error) {
    console.error('Login failed:', error);
    // Clear any partial auth state on error
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw error;
  }
};

// Logout user
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Check if user is authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Get current user
const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Get auth token
const getToken = () => {
  return localStorage.getItem('token');
};

// Get current user's profile
const getMe = async () => {
  return await api.get('/auth/me');
};

const authService = {
  register,
  login,
  logout,
  getMe,
  isAuthenticated,
  getCurrentUser
};

export default authService;
