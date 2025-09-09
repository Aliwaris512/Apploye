import React from 'react';
import { 
  Box, Typography, Button, Card, CardContent, CardHeader, 
  Divider, Grid, Chip, Avatar, LinearProgress, useTheme,
  Tabs, Tab, List, ListItem, ListItemIcon, ListItemText,
  Paper, IconButton, Tooltip, TextField, Badge
} from '@mui/material';
import { 
  ArrowBack, Edit, Delete, Add, CheckCircle, PauseCircle, 
  Cancel, Group, AccessTime, CalendarToday, Description,
  AttachFile, ChatBubbleOutline, MoreVert, PersonAdd,
  Comment as CommentIcon, Task as TaskIcon, Timeline as TimelineIcon
} from '@mui/icons-material';
import { Link, useParams, useNavigate } from 'react-router-dom';

// Sample data - replace with API call
const project = {
  id: 1,
  title: 'Website Redesign',
  description: 'Complete redesign of the company website with modern UI/UX and improved user experience across all devices.',
  status: 'in_progress',
  priority: 'high',
  startDate: '2023-06-01',
  dueDate: '2023-08-31',
  progress: 65,
  team: [
    { id: 1, name: 'John D.', role: 'Lead Developer', avatar: 'JD' },
    { id: 2, name: 'Jane S.', role: 'UI/UX Designer', avatar: 'JS' },
    { id: 3, name: 'Mike J.', role: 'Project Manager', avatar: 'MJ' },
    { id: 4, name: 'Sarah W.', role: 'Frontend Developer', avatar: 'SW' },
  ],
  tasks: [
    { id: 1, title: 'Design Homepage', status: 'completed', assignee: 2 },
    { id: 2, title: 'Implement Responsive Layout', status: 'in_progress', assignee: 1 },
    { id: 3, title: 'Add Animations', status: 'not_started', assignee: 4 },
    { id: 4, title: 'Optimize Performance', status: 'not_started', assignee: null },
  ],
  files: [
    { id: 1, name: 'design-specs.pdf', size: '2.4 MB', type: 'pdf' },
    { id: 2, name: 'wireframes.sketch', size: '3.1 MB', type: 'sketch' },
    { id: 3, name: 'style-guide.pdf', size: '1.8 MB', type: 'pdf' },
  ],
  comments: [
    { 
      id: 1, 
      user: { id: 2, name: 'Jane S.' },
      text: 'Initial design mockups are ready for review.',
      date: '2023-06-15T10:30:00Z',
      avatar: 'JS'
    },
    { 
      id: 2, 
      user: { id: 1, name: 'John D.' },
      text: 'Looking good! I\'ll start implementing the homepage this week.',
      date: '2023-06-15T11:15:00Z',
      avatar: 'JD'
    },
  ]
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [tabValue, setTabValue] = React.useState('overview');
  const [comment, setComment] = React.useState('');
  
  // In a real app, you would fetch the project data using the id
  // const { data: project, loading, error } = useProject(id);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', color: 'success', icon: <CheckCircle /> };
      case 'in_progress':
        return { label: 'In Progress', color: 'info', icon: <PauseCircle /> };
      case 'not_started':
        return { label: 'Not Started', color: 'warning', icon: <Cancel /> };
      default:
        return { label: 'Unknown', color: 'default', icon: null };
    }
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };
  
  const statusInfo = getStatusInfo(project.status);
  
  const handleAddComment = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      // In a real app, this would be an API call
      console.log('Adding comment:', comment);
      setComment('');
    }
  };
  
  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardHeader 
            title="Project Details"
            action={
              <Button 
                startIcon={<Edit />} 
                component={Link}
                to={`/projects/${id}/edit`}
              >
                Edit
              </Button>
            }
          />
          <CardContent>
            <Box mb={3}>
              <Typography variant="h5" gutterBottom>{project.title}</Typography>
              <Box display="flex" gap={1} mb={2}>
                <Chip 
                  icon={statusInfo.icon}
                  label={statusInfo.label}
                  color={statusInfo.color}
                  variant="outlined"
                />
                <Chip 
                  label={project.priority}
                  color={getPriorityColor(project.priority)}
                  variant="outlined"
                />
              </Box>
              <Typography variant="body1" color="text.secondary" paragraph>
                {project.description}
              </Typography>
            </Box>
            
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>Progress</Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Box flexGrow={1}>
                  <LinearProgress 
                    variant="determinate" 
                    value={project.progress} 
                    color={
                      project.progress < 30 ? 'error' : 
                      project.progress < 70 ? 'warning' : 'success'
                    }
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {project.progress}%
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>Timeline</Typography>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    <strong>Start:</strong> {new Date(project.startDate).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    <strong>Due:</strong> {new Date(project.dueDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>Team</Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {project.team.map(member => (
                    <Tooltip key={member.id} title={`${member.name} (${member.role})`}>
                      <Avatar>{member.avatar}</Avatar>
                    </Tooltip>
                  ))}
                  <Tooltip title="Add team member">
                    <IconButton size="small">
                      <PersonAdd />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        <Box mt={3}>
          <Tabs 
            value={tabValue === 'tasks' ? 'tasks' : 'comments'}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab value="tasks" label={`Tasks (${project.tasks.length})`} icon={<TaskIcon />} iconPosition="start" />
            <Tab 
              value="comments" 
              label={
                <Badge badgeContent={project.comments.length} color="primary">
                  Comments
                </Badge>
              } 
              icon={<CommentIcon />} 
              iconPosition="start" 
            />
          </Tabs>
          
          <Paper variant="outlined" sx={{ p: 2, mt: -1, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
            {tabValue === 'tasks' ? (
              <List>
                {project.tasks.map((task) => {
                  const taskStatus = getStatusInfo(task.status);
                  const assignee = project.team.find(m => m.id === task.assignee);
                  
                  return (
                    <ListItem 
                      key={task.id} 
                      divider
                      secondaryAction={
                        <IconButton edge="end">
                          <MoreVert />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <IconButton>
                          {taskStatus.icon}
                        </IconButton>
                      </ListItemIcon>
                      <ListItemText 
                        primary={task.title} 
                        secondary={
                          assignee && (
                            <Box component="span" display="flex" alignItems="center" gap={0.5}>
                              <Avatar sx={{ width: 20, height: 20, fontSize: '0.7rem' }}>
                                {assignee.avatar}
                              </Avatar>
                              {assignee.name}
                            </Box>
                          )
                        }
                      />
                    </ListItem>
                  );
                })}
                <Button fullWidth startIcon={<Add />} sx={{ mt: 1 }}>
                  Add Task
                </Button>
              </List>
            ) : (
              <Box>
                <List>
                  {project.comments.map((comment) => (
                    <ListItem key={comment.id} alignItems="flex-start" divider>
                      <ListItemIcon>
                        <Avatar>{comment.avatar}</Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <>
                            <Typography variant="subtitle2" component="span">
                              {comment.user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              {new Date(comment.date).toLocaleString()}
                            </Typography>
                          </>
                        }
                        secondary={
                          <Typography variant="body2" color="text.primary">
                            {comment.text}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Box component="form" onSubmit={handleAddComment} mt={2}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <Box mt={1} display="flex" justifyContent="flex-end">
                    <Button type="submit" variant="contained">
                      Comment
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Files & Links" />
          <CardContent>
            <List>
              {project.files.map((file) => (
                <ListItem 
                  key={file.id} 
                  button 
                  component="a" 
                  href={`/api/files/${file.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  secondaryAction={
                    <Typography variant="caption" color="text.secondary">
                      {file.size}
                    </Typography>
                  }
                >
                  <ListItemIcon>
                    <AttachFile />
                  </ListItemIcon>
                  <ListItemText 
                    primary={file.name}
                    primaryTypographyProps={{ noWrap: true }}
                  />
                </ListItem>
              ))}
            </List>
            <Button fullWidth startIcon={<Add />} sx={{ mt: 1 }}>
              Upload File
            </Button>
          </CardContent>
        </Card>
        
        <Card sx={{ mt: 3 }}>
          <CardHeader title="Activity" />
          <CardContent>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <TimelineIcon />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary="Project created"
                  secondary="June 1, 2023"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <CheckCircle />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary="First milestone completed"
                  secondary="June 15, 2023"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
  
  const renderTimelineTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Project Timeline</Typography>
      <Typography color="text.secondary" paragraph>
        Gantt chart or timeline view would be displayed here.
      </Typography>
    </Box>
  );
  
  return (
    <Box>
      <Box mb={3} display="flex" alignItems="center" gap={2}>
        <IconButton component={Link} to="/projects">
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">{project.title}</Typography>
        <Box flexGrow={1} />
        <Button 
          variant="outlined" 
          color="error" 
          startIcon={<Delete />}
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this project?')) {
              // Handle delete
              navigate('/projects');
            }
          }}
        >
          Delete
        </Button>
      </Box>
      
      <Tabs 
        value={tabValue}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 3 }}
      >
        <Tab value="overview" label="Overview" />
        <Tab value="timeline" label="Timeline" />
      </Tabs>
      
      {tabValue === 'overview' ? renderOverviewTab() : renderTimelineTab()}
    </Box>
  );
};

export default ProjectDetail;
