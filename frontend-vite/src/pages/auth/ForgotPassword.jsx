import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
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
} from '@mui/material';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';
  
  const handleGenerateOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setLoading(true);
      await axios.post(`${API_URL}/api/auth/generate_otp`, { email });
      setStep(2);
      setSuccess('OTP has been sent to your email');
    } catch (err) {
      console.error('Generate OTP error:', err);
      setError(err.response?.data?.detail || 'Failed to generate OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }
    
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    setStep(3);
  };
  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }
    
    // Password validation (minimum 8 chars, at least one uppercase, one lowercase, one number, one special char)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character');
      return;
    }
    
    try {
      setLoading(true);
      await axios.post(`${API_URL}/api/auth/update_password`, {
        email,
        otp,
        new_password: newPassword
      });
      
      setSuccess('Password updated successfully. Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.detail || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
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
            Reset Your Password
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ width: '100%', mt: 2, mb: 2 }}>
              {success}
            </Alert>
          )}
          
          {step === 1 && (
            <Box component="form" onSubmit={handleGenerateOtp} sx={{ mt: 1, width: '100%' }}>
              <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 2 }}>
                Enter your email address to receive a one-time password (OTP).
              </Typography>
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Send OTP'}
              </Button>
            </Box>
          )}
          
          {step === 2 && (
            <Box component="form" onSubmit={handleVerifyOtp} sx={{ mt: 1, width: '100%' }}>
              <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 2 }}>
                Enter the 6-digit OTP sent to your email.
              </Typography>
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="otp"
                label="OTP"
                name="otp"
                type="text"
                inputProps={{ maxLength: 6 }}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
              </Button>
              
              <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
                Didn't receive the code?{' '}
                <MuiLink 
                  component="button" 
                  type="button" 
                  onClick={() => {
                    setStep(1);
                    setError('');
                  }}
                >
                  Resend OTP
                </MuiLink>
              </Typography>
            </Box>
          )}
          
          {step === 3 && (
            <Box component="form" onSubmit={handleResetPassword} sx={{ mt: 1, width: '100%' }}>
              <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 2 }}>
                Enter your new password.
              </Typography>
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="New Password"
                type="password"
                id="newPassword"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                helperText="Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Reset Password'}
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setStep(1);
                  setError('');
                }}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                Back
              </Button>
            </Box>
          )}
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <MuiLink component={RouterLink} to="/login" variant="body2">
              Back to Login
            </MuiLink>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
