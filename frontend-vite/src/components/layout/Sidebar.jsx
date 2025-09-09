import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { styled, useTheme } from '@mui/material/styles';
import {
  Drawer,
  List,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Collapse,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  Timer as TimerIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  Assessment as AssessmentIcon,
  AttachMoney as AttachMoneyIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';

const drawerWidth = 240;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const Sidebar = ({ mobileOpen, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [openProjects, setOpenProjects] = React.useState(false);
  const [openReports, setOpenReports] = React.useState(false);

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager' || isAdmin;

  const handleDrawerToggle = () => {
    if (onClose) onClose();
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleProjectsClick = () => {
    setOpenProjects(!openProjects);
  };

  const handleReportsClick = () => {
    setOpenReports(!openReports);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      visible: true,
    },
    {
      text: 'Time Tracking',
      icon: <TimerIcon />,
      path: '/time-tracking',
      visible: true,
    },
    {
      text: 'Projects',
      icon: <AssignmentIcon />,
      path: '/projects',
      visible: isManager,
      children: [
        { text: 'All Projects', path: '/projects' },
        { text: 'My Projects', path: '/projects/my' },
        { text: 'Create Project', path: '/projects/create' },
      ],
    },
    {
      text: 'Team',
      icon: <GroupIcon />,
      path: '/team',
      visible: isManager,
    },
    {
      text: 'Reports',
      icon: <AssessmentIcon />,
      path: '/reports',
      visible: isManager,
      children: [
        { text: 'Activity Reports', path: '/reports/activity' },
        { text: 'Time Reports', path: '/reports/time' },
        { text: 'Productivity', path: '/reports/productivity' },
      ],
    },
    {
      text: 'Payroll',
      icon: <AttachMoneyIcon />,
      path: '/payroll',
      visible: isManager,
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      visible: true,
    },
  ];

  const drawer = (
    <div>
      <DrawerHeader>
        <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
          Activity Tracker
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </DrawerHeader>
      <Divider />
      <List>
        {menuItems.map((item) => {
          if (!item.visible) return null;
          
          if (item.children) {
            const isItemActive = item.children.some(child => 
              location.pathname.startsWith(child.path)
            );
            
            return (
              <div key={item.text}>
                <ListItemButton 
                  onClick={item.text === 'Projects' ? handleProjectsClick : handleReportsClick}
                  selected={isItemActive}
                >
                  <ListItemIcon sx={{ color: isItemActive ? 'primary.main' : 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                  {isItemActive ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse 
                  in={item.text === 'Projects' ? openProjects : openReports} 
                  timeout="auto" 
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItemButton 
                        key={child.text} 
                        sx={{ pl: 4 }}
                        selected={isActive(child.path)}
                        onClick={() => handleNavigation(child.path)}
                      >
                        <ListItemText primary={child.text} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </div>
            );
          }
          
          return (
            <ListItem 
              key={item.text} 
              disablePadding
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemButton selected={isActive(item.path)}>
                <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
