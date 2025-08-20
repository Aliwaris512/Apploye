import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Box, Button, TextField, Typography, Container, Paper, Alert, CircularProgress, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: 16,
  maxWidth: 450,
  margin: '40px auto',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
}));

const StyledForm = styled('form')({
  width: '100%',
  marginTop: 24,
});

const SubmitButton = styled(Button)({
  height: 48,
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  borderRadius: 8,
});

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    showPassword: false,
  });
  
  const { login, error, loading } = useAuth();
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleShowPassword = () => {
    setFormData({
      ...formData,
      showPassword: !formData.showPassword,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(''); // Clear previous errors
    const { email, password } = formData;
    
    if (!email || !password) {
      setLoginError('Please enter both email and password');
      return;
    }
    
    const result = await login(email, password);
    if (result?.success) {
      navigate(from, { replace: true });
    } else if (result?.message) {
      // Ensure we're only showing string error messages
      setLoginError(typeof result.message === 'string' ? result.message : 'Login failed');
    } else {
      setLoginError('Login failed. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <StyledPaper>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <LockOutlined color="primary" sx={{ fontSize: 40, mb: 2 }} />
          <Typography component="h1" variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to continue to Activity Tracker
          </Typography>
        </Box>
        
        {(error || loginError) && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {String(loginError || error || 'An error occurred during login')}
          </Alert>
        )}
        
        <StyledForm onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          <TextField
            variant="outlined"
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
                    onClick={toggleShowPassword}
                    edge="end"
                  >
                    {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Link to="/forgot-password" style={{ textDecoration: 'none', color: '#1976d2', fontSize: '0.875rem' }}>
              Forgot password?
            </Link>
          </Box>
          
          <SubmitButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            size="large"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </SubmitButton>
          
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500 }}>
                Sign up
              </Link>
            </Typography>
          </Box>
        </StyledForm>
      </StyledPaper>
    </Container>
  );
};

export default Login;
