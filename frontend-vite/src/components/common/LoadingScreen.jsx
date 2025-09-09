import { Box, CircularProgress, Typography, Button } from '@mui/material';

const LoadingScreen = ({ message = 'Loading...', error = false }) => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="background.paper"
      p={3}
      textAlign="center"
    >
      {!error ? (
        <>
          <CircularProgress size={60} thickness={4} color="primary" />
          <Typography variant="h6" color="textSecondary" mt={2}>
            {message}
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="h5" color="error" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" color="textSecondary" mb={3}>
            {message}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleRefresh}
            sx={{ mt: 2 }}
          >
            Refresh Page
          </Button>
        </>
      )}
    </Box>
  );
};

export default LoadingScreen;
