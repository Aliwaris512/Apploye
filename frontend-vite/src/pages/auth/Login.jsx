import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, selectAuthError, selectAuthLoading } from '../../features/auth/authSlice';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link as MuiLink,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    showPassword: false,
  });
  const [error, setError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  
  const authError = useSelector(selectAuthError);
  const loading = useSelector(selectAuthLoading);
  
  useEffect(() => {
    // Clear any previous errors when component mounts
    setError('');
    
    // If there's an auth error from Redux, show it
    if (authError) {
      setError(authError);
    }
  }, [authError]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleTogglePasswordVisibility = () => {
    setFormData(prev => ({
      ...prev,
      showPassword: !prev.showPassword
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      console.log('Attempting login with:', { email: formData.email });
      const resultAction = await dispatch(login({
        email: formData.email,
        password: formData.password
      }));
      
      console.log('Login result:', resultAction);
      
      // Check if the login was successful
      if (login.fulfilled.match(resultAction)) {
        console.log('Login successful, redirecting to:', from);
        // Redirect to the page the user was trying to access or home
        navigate(from, { replace: true });
      } else if (login.rejected.match(resultAction)) {
        // Handle login failure
        console.error('Login failed:', resultAction.error?.message || resultAction.payload);
        setError(resultAction.payload || 'Login failed. Please check your credentials.');
      } else {
        console.warn('Unexpected login result:', resultAction);
        setError('An unexpected error occurred during login');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred during login');
    }
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
            Welcome to Activity Tracker
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
            Please sign in to continue
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={formData.showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <MuiLink component={Link} to="/forgot-password" variant="body2">
                Forgot password?
              </MuiLink>
              <Box sx={{ mt: 2, color: 'text.secondary' }}>
                <Typography variant="body2">
                  Please contact your administrator for account access
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
