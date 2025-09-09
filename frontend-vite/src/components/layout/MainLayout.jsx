import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const MainLayout = ({ children }) => {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <TopBar onMenuClick={handleDrawerToggle} />
      <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${theme.mixins.drawerWidth}px)` },
          marginTop: '64px',
        }}
      >
        {children ? children : <Outlet />}
      </Box>
    </Box>
  );
};

export default MainLayout;
