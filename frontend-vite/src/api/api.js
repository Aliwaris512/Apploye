import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    const isAuthRequest = originalRequest?.url?.includes('/auth/');
    const isLoginPage = window.location.pathname === '/login' || 
                       window.location.pathname === '/register';
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Do NOT auto-redirect or clear auth here to avoid redirect loops.
      // Let the caller decide how to handle 401s (e.g., show toast or silent empty state).
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default api;
