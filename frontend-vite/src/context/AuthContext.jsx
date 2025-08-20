import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext(null);

// Use environment variable or default to development URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Function to set auth token in axios headers and local storage
  const setAuthToken = useCallback((token) => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, []);

  // Verify token on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = useCallback(async (token) => {
    try {
      // First, check if token exists
      if (!token) {
        setLoading(false);
        return false;
      }

      // Decode the JWT token to get user information
      const base64Url = token.split('.')[1];
      if (!base64Url) {
        throw new Error('Invalid token format');
      }
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      
      // Check if token is expired
      const currentTime = Date.now() / 1000;
      if (payload.exp && payload.exp < currentTime) {
        throw new Error('Token has expired');
      }
      
      // Extract user information from the token
      const user = {
        id: payload.id,
        email: payload.sub,
        role: payload.role,
        // Add any other user fields you need
      };
      
      setUser(user);
      setAuthToken(token);
      return true;
    } catch (err) {
      console.error('Token verification failed:', err);
      // If token is invalid or expired, clear it
      setAuthToken(null);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, [setAuthToken]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Send as JSON data since the backend supports both formats
      const response = await api.post('/login', {
        email: email,
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.data && response.data.access_token) {
        // Store the token
        const token = response.data.access_token;
        
        // Decode the JWT token to get user information
        const base64Url = token.split('.')[1];
        if (!base64Url) {
          throw new Error('Invalid token format');
        }
        
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        
        // Extract user information from the token
        const user = {
          id: payload.id,
          email: payload.sub,
          role: payload.role,
          // Add any other user fields you need
        };
        
        setUser(user);
        setAuthToken(token);
        navigate('/dashboard');
        return { success: true };
      }
      
      return { success: false, message: 'Invalid response from server' };
    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      
      // Handle different types of error responses
      if (err.response) {
        // Handle 422 validation errors
        if (err.response.status === 422 && err.response.data?.detail) {
          if (Array.isArray(err.response.data.detail)) {
            errorMessage = err.response.data.detail
              .map(error => error.msg || error.message || 'Invalid input')
              .join('. ');
          } else if (typeof err.response.data.detail === 'string') {
            errorMessage = err.response.data.detail;
          }
        }
        // Handle other error statuses
        else if (err.response.data?.detail) {
          errorMessage = err.response.data.detail;
        }
      }
      
      setError(errorMessage);
      return { 
        success: false, 
        message: errorMessage,
        status: err.response?.status
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/signup', userData);
      
      if (response.data) {
        // After successful registration, log the user in
        const loginResponse = await login(userData.email, userData.password);
        if (loginResponse.success) {
          return { success: true };
        }
      }
      
      return { success: false, message: 'Registration successful but failed to log in. Please try logging in.' };
    } catch (err) {
      const message = err.response?.data?.detail || 'Registration failed. The email might be already in use.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Optionally call backend to invalidate token
    setAuthToken(null);
    setUser(null);
    navigate('/login');
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      // Using the generate_otp endpoint from the backend
      await api.post('/generate_otp', { email });
      return { success: true };
    } catch (err) {
      // Don't reveal if email exists or not for security
      const message = 'If an account exists with this email, you will receive an OTP for password reset.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Alias for forgotPassword to maintain backward compatibility
  const requestPasswordReset = forgotPassword;

  const resetPassword = async (email, otp, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/update_password', {
        email,
        otp,
        new_password: newPassword
      });
      
      if (response.data) {
        // After successful password reset, log the user in
        const loginResponse = await login(email, newPassword);
        if (loginResponse.success) {
          return { success: true };
        }
      }
      
      return { success: false, message: 'Password reset successful but failed to log in. Please try logging in.' };
    } catch (err) {
      const message = err.response?.data?.detail || 'Password reset failed. The OTP may be invalid or expired.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        register,
        requestPasswordReset,
        resetPassword,
        isAuthenticated: !!user,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
