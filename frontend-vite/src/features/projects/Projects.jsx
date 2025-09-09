import React, { useState } from 'react';
import { 
  Box, Typography, Button, Card, CardContent, CardHeader, 
  Divider, Grid, TextField, ToggleButton, ToggleButtonGroup,
  IconButton, Tooltip, Chip, Avatar, LinearProgress, useTheme,
  useMediaQuery, Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import { 
  Add, Search, FilterList, MoreVert, ViewList, GridView, 
  Sort, CheckCircle, PauseCircle, Cancel, Group, AccessTime,
  Star, StarBorder, CalendarToday
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

// Sample data
const projects = [
  {
    id: 1,
    title: 'Website Redesign',
    description: 'Complete redesign of the company website with modern UI/UX',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2023-08-31',
    progress: 65,
    team: [
      { id: 1, name: 'John D.' },
      { id: 2, name: 'Jane S.' },
      { id: 3, name: 'Mike J.' }
    ],
    isFavorite: true
  },
  // Add more sample projects as needed
];

const statusOptions = [
  { value: 'all', label: 'All Projects' },
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' }
];

const Projects = () => {
  const [view, setView] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'not_started': return 'warning';
      default: return 'default';
    }
  };

  const ProjectCard = ({ project }) => (
    <Card component={Link} to={`/projects/${project.id}`} style={{ textDecoration: 'none', height: '100%' }}>
      <CardHeader
        title={project.title}
        subheader={
          <Chip 
            label={project.status.replace('_', ' ')}
            size="small"
            color={getStatusColor(project.status)}
          />
        }
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary" paragraph>
          {project.description}
        </Typography>
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {project.progress}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={project.progress} 
            color={
              project.progress < 30 ? 'error' : 
              project.progress < 70 ? 'warning' : 'success'
            }
          />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" gutterBottom>Projects</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and track all your projects
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} component={Link} to="/projects/new">
          New Project
        </Button>
      </Box>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                SelectProps={{ native: true }}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2} sx={{ textAlign: 'right' }}>
              <ToggleButtonGroup
                value={view}
                exclusive
                onChange={(e, v) => v && setView(v)}
                size="small"
              >
                <ToggleButton value="grid"><GridView /></ToggleButton>
                <ToggleButton value="list"><ViewList /></ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {view === 'grid' ? (
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={project.id}>
              <ProjectCard project={project} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box>
          {filteredProjects.map((project) => (
            <Box key={project.id} mb={2}>
              <ProjectCard project={project} />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Projects;
