import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password, role }, { rejectWithValue }) => {
    try {
      const url = `${API_URL}/api/auth/register`;
      console.log('Sending registration request to:', url);
      
      const response = await axios.post(
        url,
        { name, email, password, role },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          validateStatus: () => true, // Don't throw for any status code
        }
      );
      
      console.log('Register response status:', response.status, 'data:', response.data);
      
      if (response.status !== 201) {
        const errorMsg = response.data?.detail || 'Registration failed';
        console.error('Registration failed:', errorMsg);
        return rejectWithValue(errorMsg);
      }
      
      // Automatically log in the user after registration
      const loginResponse = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      const { access_token } = loginResponse.data;
      if (!access_token) {
        console.error('No access token received after registration');
        return rejectWithValue('Registration successful but login failed');
      }
      
      localStorage.setItem('token', access_token);
      
      // Fetch user data
      const userResponse = await axios.get(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      
      return {
        user: userResponse.data,
        token: access_token,
      };
    } catch (error) {
      console.error('Registration error:', error);
      return rejectWithValue(
        error.response?.data?.detail || 'Registration failed. Please try again.'
      );
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const form = new URLSearchParams();
      form.append('username', email);
      form.append('password', password);

      // Try FastAPI sample endpoint first: POST /token
      let response = await axios.post(`${API_URL}/token`, form, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        validateStatus: () => true,
      });

      // If /token is not available (404/405), fall back to legacy /api/auth/token
      if (response.status === 404 || response.status === 405) {
        response = await axios.post(`${API_URL}/api/auth/token`, form, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          validateStatus: () => true,
        });
      }

      if (response.status !== 200) {
        const errorMsg = response.data?.detail || 'Login failed';
        return rejectWithValue(errorMsg);
      }

      const { access_token } = response.data;
      if (!access_token) {
        console.error('No access token in response:', response.data);
        return rejectWithValue('No access token received');
      }
      
      localStorage.setItem('token', access_token);

      // Backend doesn't expose /api/auth/me; create a basic user object.
      // The sample backend uses an in-memory user with id "1" and role "admin".
      const user = { id: '1', name: email.split('@')[0] || 'user', email, role: 'admin' };
      localStorage.setItem('user', JSON.stringify(user));
      return { user, token: access_token };
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      // Handle validation errors (422) and other errors
      if (error.response?.status === 422) {
        const errorMsg = error.response?.data?.detail?.[0]?.msg || 'Invalid email or password';
        return rejectWithValue(errorMsg);
      }
      return rejectWithValue(error.response?.data?.detail || 'Login failed');
    }
  }
);

const token = localStorage.getItem('token');
const initialState = {
  user: null,
  token: token,
  isAuthenticated: !!token, // Set to true if token exists
  loading: false,
  error: null,
  _initialized: false, // Add a flag to track if initial auth check is done
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state._initialized = true;
    },
    clearError: (state) => {
      state.error = null;
    },
    initializeAuth: (state) => {
      state._initialized = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      
      // Registration cases
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
      });
  },
});

export const { logout, clearError, initializeAuth } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthToken = (state) => state.auth.token;

export default authSlice.reducer;
