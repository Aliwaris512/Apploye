import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
  Chip, 
  Typography, 
  useTheme, 
  Avatar, 
  Paper, 
  Skeleton, 
  Button,
  Grid,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Work as ProjectIcon, 
  Person as ManagerIcon, 
  CalendarToday as CalendarIcon,
  CheckCircle as ActiveIcon, 
  PauseCircleFilled as PausedIcon,
  CheckCircleOutline as CompletedIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

const ProjectList = ({ 
  projects = [], 
  loading = false, 
  error = null,
  onEditProject 
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const menuOpen = Boolean(anchorEl);

  // Get status icon based on project status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <ActiveIcon color="success" sx={{ fontSize: 16, mr: 0.5 }} />;
      case 'paused':
        return <PausedIcon color="warning" sx={{ fontSize: 16, mr: 0.5 }} />;
      case 'completed':
        return <CompletedIcon color="action" sx={{ fontSize: 16, mr: 0.5 }} />;
      default:
        return null;
    }
  };

  // Get status color for chips
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

  // Handle menu open
  const handleMenuOpen = (event, project) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  // Handle edit click
  const handleEditClick = () => {
    if (selectedProject && onEditProject) {
      onEditProject(selectedProject);
    }
    handleMenuClose();
  };

  // Show loading state
  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3].map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
        ))}
      </Grid>
    );
  }

  // Show error state
  if (error) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">
          Error loading projects: {error.message || 'Unknown error occurred'}
        </Typography>
      </Paper>
    );
  }

  // Show empty state
  if (projects.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No projects found</Typography>
      </Paper>
    );
  }

  // Render project list
  return (
    <Box>
      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    <ProjectIcon />
                  </Avatar>
                }
                title={
                  <Typography variant="h6" noWrap>
                    {project.name}
                  </Typography>
                }
                subheader={
                  <Typography variant="body2" color="text.secondary">
                    {project.client?.name || 'No client'}
                  </Typography>
                }
              />
              <CardContent sx={{ flexGrow: 1, pt: 0 }}>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {project.description || 'No description provided'}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ManagerIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {project.manager?.name || 'No manager assigned'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {project.startDate ? format(parseISO(project.startDate), 'MMM d, yyyy') : 'No start date'}
                  </Typography>
                </Box>
              </CardContent>
              
              <Box sx={{ 
                p: 2, 
                pt: 0, 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: `1px solid ${theme.palette.divider}`
              }}>
                <Chip
                  label={project.status}
                  size="small"
                  color={getStatusColor(project.status)}
                  variant="outlined"
                  sx={{ textTransform: 'capitalize' }}
                />
                
                <Box>
                  <Button 
                    size="small" 
                    color="primary"
                    component={RouterLink}
                    to={`/projects/${project.id}`}
                    sx={{ mr: 1 }}
                  >
                    View
                  </Button>
                  <Button 
                    size="small" 
                    color="primary"
                    variant="contained"
                    onClick={() => onEditProject?.(project)}
                  >
                    Edit
                  </Button>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Project Menu */}
      <Menu
        id="project-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 1,
          sx: {
            minWidth: 180,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEditClick}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Project
        </MenuItem>
        <MenuItem>
          <PausedIcon fontSize="small" sx={{ mr: 1 }} />
          {selectedProject?.status === 'active' ? 'Pause' : 'Resume'} Project
        </MenuItem>
        <MenuItem>
          <CompletedIcon fontSize="small" sx={{ mr: 1 }} />
          Mark as {selectedProject?.status === 'completed' ? 'In Progress' : 'Completed'}
        </MenuItem>
      </Menu>
    </Box>
  );
};

ProjectList.defaultProps = {
  onEditProject: null,
};

export default ProjectList;
