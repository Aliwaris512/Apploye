import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import { Email as EmailIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
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

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { requestPasswordReset } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setIsLoading(true);
        const result = await requestPasswordReset(email);
        
        if (result?.success) {
          setEmailSent(true);
        }
      } catch (error) {
        console.error('Password reset request failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (emailSent) {
    return (
      <Container component="main" maxWidth="xs">
        <StyledPaper>
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <EmailIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
            <Typography component="h1" variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Check Your Email
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We've sent a password reset link to <strong>{email}</strong>.
              Please check your email and follow the instructions to reset your password.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Didn't receive the email? Check your spam folder or{' '}
              <Link 
                to="#" 
                onClick={(e) => {
                  e.preventDefault();
                  setEmailSent(false);
                }}
                style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500 }}
              >
                try again
              </Link>.
            </Typography>
            <Button
              variant="outlined"
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

  return (
    <Container component="main" maxWidth="xs">
      <StyledPaper>
        <BackButton aria-label="go back" onClick={handleBack}>
          <ArrowBackIcon />
        </BackButton>
        
        <Box sx={{ textAlign: 'center', mb: 3, mt: 2 }}>
          <EmailIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography component="h1" variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Forgot Password?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter your email address and we'll send you a link to reset your password.
          </Typography>
        </Box>
        
        <StyledForm onSubmit={handleSubmit} noValidate>
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
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (formErrors.email) {
                setFormErrors({ ...formErrors, email: null });
              }
            }}
            error={!!formErrors.email}
            helperText={formErrors.email}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
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
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
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

export default ForgotPassword;
