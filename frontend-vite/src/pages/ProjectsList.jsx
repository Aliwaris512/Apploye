import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Button, 
  Container, 
  Paper, 
  Tabs, 
  Tab, 
  TextField, 
  InputAdornment, 
  Typography,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import ProjectList from '../features/projects/ProjectList';
import ProjectForm from '../features/projects/ProjectForm';
import { 
  fetchProjects, 
  createProject, 
  updateProject, 
  selectAllProjects, 
  selectProjectsStatus,
  selectProjectsError,
  selectProjectById
} from '../features/projects/projectSlice';

const ProjectsList = () => {
  const dispatch = useDispatch();
  const projects = useSelector(selectAllProjects);
  const status = useSelector(selectProjectsStatus);
  const error = useSelector(selectProjectsError);
  const loading = status === 'loading';
  
  const [tabValue, setTabValue] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  // Fetch projects on component mount
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProjects());
    }
  }, [status, dispatch]);

  // Handle success/error messages
  useEffect(() => {
    if (status === 'succeeded' && formOpen) {
      handleCloseForm();
      showSnackbar(
        editingProject ? 'Project updated successfully' : 'Project created successfully',
        'success'
      );
    } else if (status === 'failed') {
      showSnackbar(error || 'An error occurred while saving the project', 'error');
    }
  }, [status, error, formOpen, editingProject]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleOpenForm = (project = null) => {
    setEditingProject(project);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingProject(null);
  };

  const handleSubmit = async (projectData) => {
    try {
      if (editingProject) {
        // Update existing project
        await dispatch(updateProject({ ...editingProject, ...projectData })).unwrap();
        setSnackbar({
          open: true,
          message: 'Project updated successfully',
          severity: 'success'
        });
      } else {
        // Create new project
        await dispatch(createProject(projectData)).unwrap();
        setSnackbar({
          open: true,
          message: 'Project created successfully',
          severity: 'success'
        });
      }
      handleCloseForm();
      // Refresh projects list
      dispatch(fetchProjects());
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'An error occurred',
        severity: 'error'
      });
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };


  // Filter projects based on tab and search query
  const filteredProjects = React.useMemo(() => {
    if (!Array.isArray(projects)) return [];
    
    return projects.filter(project => {
      if (!project) return false;
      
      const matchesSearch = project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (tabValue === 'all') return matchesSearch;
      return project.status === tabValue && matchesSearch;
    });
  }, [projects, tabValue, searchQuery]);

  // Handle project edit from ProjectList
  const handleEditProject = (project) => {
    setEditingProject(project);
    setFormOpen(true);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Projects
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
          disabled={loading}
          sx={{ minWidth: '160px' }}
        >
          New Project
        </Button>
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          mb: 3, 
          p: 2, 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{ minHeight: '48px' }}
          >
            <Tab label="All" value="all" />
            <Tab label="Active" value="active" />
            <Tab label="Paused" value="paused" />
            <Tab label="Completed" value="completed" />
          </Tabs>

          <TextField
            variant="outlined"
            size="small"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
        </Box>
      </Paper>

      <ProjectList 
        projects={filteredProjects}
        loading={loading}
        error={error}
        onEditProject={handleEditProject}
      />

      {/* Project Form Dialog */}
      <ProjectForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        project={editingProject}
        loading={loading}
        error={error}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProjectsList;
