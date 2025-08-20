import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="background.paper"
    >
      <CircularProgress size={60} thickness={4} color="primary" />
      <Typography variant="h6" color="textSecondary" mt={2}>
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingScreen;
