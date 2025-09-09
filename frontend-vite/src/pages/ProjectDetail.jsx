import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Divider, Grid, Button, Chip,
  Avatar, LinearProgress, Tabs, Tab, Container
} from '@mui/material';
import {
  Work as ProjectIcon, People as TeamIcon, 
  Assessment as ReportsIcon, Settings as SettingsIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { 
  fetchProjects, 
  selectProjectById,
  selectProjectsLoading,
  selectProjectsError 
} from '../features/projects/projectSlice';
import TaskList from '../features/tasks/TaskList';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const currentProject = useSelector((state) => 
    selectProjectById(state, projectId)
  );
  const loading = useSelector(selectProjectsLoading);
  const error = useSelector(selectProjectsError);
  const [activeTab, setActiveTab] = useState('tasks');

  // Fetch project data when component mounts or projectId changes
  useEffect(() => {
    if (projectId) {
      // Fetch all projects and filter for the current project
      dispatch(fetchProjects()).then((result) => {
        // The actual filtering will be done by the selector
      });
    }
  }, [dispatch, projectId]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography color="error">Error loading project: {error}</Typography>
      </Container>
    );
  }

  if (!currentProject) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Project not found</Typography>
      </Container>
    );
  }

  const { name, description, status, startDate, dueDate, client, manager } = currentProject;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          component={Link}
          to="/projects"
          sx={{ mb: 2 }}
        >
          Back to Projects
        </Button>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ProjectIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h4" component="h1">
                {name}
              </Typography>
              <Chip
                label={status}
                color={
                  status === 'active' ? 'success' :
                  status === 'on_hold' ? 'warning' : 'default'
                }
                size="small"
                sx={{ ml: 2, textTransform: 'capitalize' }}
              />
            </Box>
            
            {description && (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {description}
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              {client && (
                <Chip
                  avatar={<Avatar>C</Avatar>}
                  label={`Client: ${client}`}
                  variant="outlined"
                />
              )}
              
              {manager && (
                <Chip
                  icon={<PeopleIcon />}
                  label={`Manager: ${manager.name || 'Unassigned'}`}
                  variant="outlined"
                />
              )}
              
              {startDate && (
                <Chip
                  label={`Start: ${new Date(startDate).toLocaleDateString()}`}
                  variant="outlined"
                />
              )}
              
              {dueDate && (
                <Chip
                  label={`Due: ${new Date(dueDate).toLocaleDateString()}`}
                  color={new Date(dueDate) < new Date() ? 'error' : 'default'}
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
          
          <Box>
            <Button variant="contained" color="primary" sx={{ mr: 1 }}>
              New Task
            </Button>
            <Button variant="outlined" color="primary">
              Edit Project
            </Button>
          </Box>
        </Box>
        
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<ProjectIcon />} label="Tasks" value="tasks" />
            <Tab icon={<PeopleIcon />} label="Team" value="team" />
            <Tab icon={<ReportsIcon />} label="Reports" value="reports" />
            <Tab icon={<SettingsIcon />} label="Settings" value="settings" />
          </Tabs>
          
          <Divider />
          
          <Box sx={{ p: 3 }}>
            {activeTab === 'tasks' && <TaskList projectId={projectId} />}
            {activeTab === 'team' && <Typography>Team members will be listed here</Typography>}
            {activeTab === 'reports' && <Typography>Project reports will be displayed here</Typography>}
            {activeTab === 'settings' && <Typography>Project settings will be available here</Typography>}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProjectDetail;
