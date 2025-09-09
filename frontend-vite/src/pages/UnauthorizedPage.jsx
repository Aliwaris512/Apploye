import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Box, Typography } from '@mui/material';
import { Lock as LockIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <LockIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
        <Typography component="h1" variant="h3" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="h6" color="textSecondary" paragraph>
          You don't have permission to access this page.
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          The page you are trying to access requires additional permissions. 
          Please contact your administrator if you believe this is a mistake.
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
            sx={{ mt: 1 }}
          >
            Go Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGoHome}
            sx={{ mt: 1 }}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;
