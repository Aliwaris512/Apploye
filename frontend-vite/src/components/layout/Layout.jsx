import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Box, CssBaseline, Drawer, AppBar, Toolbar, List, Typography,
  Divider, IconButton, ListItem, ListItemButton, ListItemIcon,
  ListItemText, useMediaQuery, Avatar, Menu, MenuItem, Button
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard as DashboardIcon, Timeline as TimelineIcon,
  Person as PersonIcon, Settings as SettingsIcon, ExitToApp as ExitToAppIcon,
  AdminPanelSettings as AdminPanelSettingsIcon, ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

const Layout = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Activity', icon: <TimelineIcon />, path: '/activity' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ text: 'Admin', icon: <AdminPanelSettingsIcon />, path: '/admin' });
  }

  const settingsMenu = [
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { divider: true },
    { text: 'Logout', icon: <ExitToAppIcon />, action: () => {
      logout();
      navigate('/login');
    }},
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setOpen(!open)}
            edge="start"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Activity Tracker
          </Typography>
          <Button color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            {user?.name}
          </Button>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={open}
        onClose={() => isMobile && setOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton onClick={() => navigate(item.path)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {settingsMenu.map((item, index) => (
          item.divider ? (
            <Divider key={`divider-${index}`} />
          ) : (
            <MenuItem 
              key={item.text}
              onClick={() => {
                setAnchorEl(null);
                if (item.action) item.action();
                else if (item.path) navigate(item.path);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText>{item.text}</ListItemText>
            </MenuItem>
          )
        ))}
      </Menu>
    </Box>
  );
};

export default Layout;
