import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  Alert, 
  CircularProgress,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Lock as LockIcon, Visibility, VisibilityOff, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
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
  position: 'relative',
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

const BackButton = styled(IconButton)({
  position: 'absolute',
  left: 16,
  top: 16,
});

const PasswordStrengthMeter = ({ password }) => {
  if (!password) return null;
  
  const getStrength = (pwd) => {
    let strength = 0;
    
    // Length check
    if (pwd.length >= 8) strength++;
    
    // Contains lowercase
    if (/[a-z]/.test(pwd)) strength++;
    
    // Contains uppercase
    if (/[A-Z]/.test(pwd)) strength++;
    
    // Contains number
    if (/[0-9]/.test(pwd)) strength++;
    
    // Contains special character
    if (/[!@#$%^&*_\-]/.test(pwd)) strength++;
    
    return strength;
  };
  
  const strength = getStrength(password);
  const strengthText = [
    'Very Weak',
    'Weak',
    'Fair',
    'Good',
    'Strong',
    'Very Strong'
  ][Math.min(strength, 5)];
  
  const strengthColor = [
    '#ff4444', // red
    '#ffbb33', // amber
    '#ffbb33', // amber
    '#00C851', // green
    '#00C851', // green
    '#00C851'  // green
  ][Math.min(strength, 5)];
  
  return (
    <Box sx={{ width: '100%', mt: 1, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          Password Strength: <span style={{ color: strengthColor, fontWeight: 600 }}>{strengthText}</span>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {password.length}/64
        </Typography>
      </Box>
      <Box 
        sx={{
          height: 4,
          width: '100%',
          backgroundColor: '#e0e0e0',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{
            height: '100%',
            width: `${Math.min((strength / 5) * 100, 100)}%`,
            backgroundColor: strengthColor,
            transition: 'width 0.3s ease, background-color 0.3s ease'
          }}
        />
      </Box>
    </Box>
  );
};

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid or expired reset link. Please request a new password reset.');
    }
  }, [token, email]);

  const validateForm = () => {
    const newErrors = {};
    
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
    
    if (validateForm() && token && email) {
      try {
        setIsLoading(true);
        setError('');
        
        const result = await resetPassword({
          token,
          email,
          new_password: formData.password
        });
        
        if (result?.success) {
          setSuccess(true);
        } else {
          setError(result?.message || 'Failed to reset password. Please try again.');
        }
      } catch (err) {
        console.error('Password reset failed:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (success) {
    return (
      <Container component="main" maxWidth="xs">
        <StyledPaper>
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <LockIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
            <Typography component="h1" variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Password Reset Successful
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your password has been successfully reset. You can now log in with your new password.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => navigate('/login')}
              sx={{ mt: 2 }}
            >
              Back to Login
            </Button>
          </Box>
        </StyledPaper>
      </Container>
    );
  }

  if (!token || !email) {
    return (
      <Container component="main" maxWidth="xs">
        <StyledPaper>
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <LockIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
            <Typography component="h1" variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Invalid Reset Link
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {error || 'The password reset link is invalid or has expired. Please request a new password reset.'}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              component={Link}
              to="/forgot-password"
              sx={{ mt: 2 }}
            >
              Request New Reset Link
            </Button>
          </Box>
        </StyledPaper>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <StyledPaper>
        <BackButton aria-label="go back" onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </BackButton>
        
        <Box sx={{ textAlign: 'center', mb: 3, mt: 2 }}>
          <LockIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography component="h1" variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Reset Password
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter your new password below.
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
            name="password"
            label="New Password"
            type={formData.showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
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
            sx={{ mb: 1 }}
          />
          
          <PasswordStrengthMeter password={formData.password} />
          
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm New Password"
            type={formData.showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!formErrors.confirmPassword}
            helperText={formErrors.confirmPassword}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
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
            sx={{ mb: 3 }}
          />
          
          <SubmitButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isLoading}
            size="large"
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
          </SubmitButton>
          
          <Box sx={{ textAlign: 'center', mt: 3, mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Remember your password?{' '}
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

export default ResetPassword;
