import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

const initialState = {
  user: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  isInitialized: false,
  message: '',
};

// Initialize auth state from localStorage
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { getState }) => {
    try {
      // Don't reinitialize if already initialized
      const { isInitialized } = getState().auth;
      if (isInitialized) {
        return null;
      }

      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      
      if (!token || !user) {
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Auth initialization failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  }
);

// Selectors
export const selectIsAuthenticated = (state) => {
  // Just check for token in localStorage for now
  return !!localStorage.getItem('token');
};
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectCurrentUser = (state) => state.auth.user;

// Register user then login to obtain token
const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      // Create the user account
      await authService.register(userData);

      // Immediately log in to get access token and user profile
      const user = await authService.login(userData.email, userData.password);

      // Persist user for good measure (authService.login already stores token/user)
      localStorage.setItem('user', JSON.stringify(user));

      return user;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          (error.response.data.detail || error.response.data.message)) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Login user
const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:9000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Handle validation errors from FastAPI
        if (data.detail && Array.isArray(data.detail)) {
          // Format validation errors
          const errorMessages = data.detail.map(err => 
            `${err.loc ? err.loc.join('.') + ': ' : ''}${err.msg}`
          ).join('\n');
          return rejectWithValue(errorMessages);
        }
        return rejectWithValue(data.detail?.message || data.detail || 'Login failed');
      }

      if (!data.access_token) {
        return rejectWithValue('No access token received');
      }

      // Save token
      localStorage.setItem('token', data.access_token);
      
      // Return minimal user data if user data isn't in the response
      if (!data.user) {
        return { email };
      }
      
      // Save user data if available
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      // Handle different types of error responses
      let errorMessage = 'An error occurred during login';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const { data } = error.response;
        
        if (data && data.detail) {
          if (Array.isArray(data.detail)) {
            // Handle validation errors
            errorMessage = data.detail.map(err => 
              `${err.loc ? err.loc.join('.') + ': ' : ''}${err.msg}`
            ).join('\n');
          } else if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          } else if (data.detail.message) {
            errorMessage = data.detail.message;
          }
        } else if (data && data.message) {
          errorMessage = data.message;
        } else if (data) {
          errorMessage = JSON.stringify(data);
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Logout user
const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setError: (state, action) => {
      state.isError = true;
      state.message = action.payload;
      state.isLoading = false;
    },
    reset: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.isSuccess = true;
      state.isInitialized = true;
      state.isError = false;
      state.message = '';
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      state.isSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = action.payload;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      });
  },
});

// Export actions
export const { 
  reset, 
  setError, 
  loginSuccess, 
  logoutSuccess 
} = authSlice.actions;

// Export thunks
export { register, login, logout };

export default authSlice.reducer;
