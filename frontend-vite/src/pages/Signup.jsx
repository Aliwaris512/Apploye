import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Box, Button, TextField, Typography, Container, Paper, Alert, CircularProgress, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff, PersonAddOutlined } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)({
  marginTop: 40,
  padding: 32,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: 16,
  maxWidth: 500,
  margin: '40px auto',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
});

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
  marginTop: 8,
});

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
  });
  
  const [formErrors, setFormErrors] = useState({});
  const { register, error, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*_\-])[A-Za-z\d!@#$%^&*_\-]{8,}$/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const toggleShowPassword = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const { confirmPassword, showPassword, showConfirmPassword, ...signupData } = formData;
      const result = await register(signupData);
      
      if (result?.success) {
        navigate('/login', { 
          state: { 
            from: from,
            message: 'Registration successful! Please log in.'
          } 
        });
          navigate('/login');
        }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <StyledPaper>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <PersonAddOutlined color="primary" sx={{ fontSize: 40, mb: 2 }} />
          <Typography component="h1" variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Create an Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Join Activity Tracker to track your app usage
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2, textAlign: 'left' }}>
            {error}
          </Alert>
        )}
        
        <StyledForm onSubmit={handleSubmit} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={formData.name}
            onChange={handleChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          
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
            value={formData.email}
            onChange={handleChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
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
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            error={!!formErrors.password}
            helperText={formErrors.password || 'At least 8 characters with uppercase, lowercase, number, and special character'}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => toggleShowPassword('showPassword')}
                    edge="end"
                  >
                    {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type={formData.showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!formErrors.confirmPassword}
            helperText={formErrors.confirmPassword}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={() => toggleShowPassword('showConfirmPassword')}
                    edge="end"
                  >
                    {formData.showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          <SubmitButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            size="large"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
          </SubmitButton>
          
          <Box sx={{ textAlign: 'center', mt: 3, mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link 
                to="/login" 
                style={{ 
                  color: '#1976d2', 
                  textDecoration: 'none', 
                  fontWeight: 500 
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </StyledForm>
      </StyledPaper>
    </Container>
  );
};

export default Signup;
