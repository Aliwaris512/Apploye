import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Avatar,
  Chip,
  useTheme,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Timer as TimerIcon,
  Assignment as ProjectIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

const TimeEntryItem = ({
  entry,
  projects = [],
  onEdit,
  onDelete,
  onStart,
  onStop,
  isActive = false,
  showProject = true,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(entry);
    handleClose();
  };

  const handleDelete = () => {
    onDelete(entry.id);
    handleClose();
  };

  const handleStart = () => {
    onStart(entry);
    handleClose();
  };

  const handleStop = () => {
    onStop(entry.id);
    handleClose();
  };

  // Find the project for this entry
  const project = projects.find(p => p.id === entry.projectId) || {};
  
  // Format date and time
  const startTime = parseISO(entry.startTime);
  const endTime = entry.endTime ? parseISO(entry.endTime) : null;
  const duration = endTime 
    ? calculateDuration(startTime, endTime)
    : calculateDuration(startTime, new Date()) + ' (active)';

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        mb: 2, 
        p: 2,
        borderLeft: 4,
        borderColor: isActive ? 'primary.main' : 'transparent',
        position: 'relative',
        '&:hover': {
          boxShadow: 2,
        },
      }}
    >
      <Box display="flex" alignItems="flex-start">
        <Avatar 
          sx={{ 
            bgcolor: project.color || 'grey.300',
            color: 'common.white',
            mr: 2,
            mt: 0.5,
          }}
        >
          <ProjectIcon />
        </Avatar>
        
        <Box flexGrow={1}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="subtitle1" fontWeight="medium">
                {entry.description || 'No description'}
              </Typography>
              
              {showProject && project && (
                <Chip 
                  label={project.name}
                  size="small"
                  sx={{ mt: 0.5, mr: 1, mb: 1 }}
                />
              )}
              
              <Box display="flex" flexWrap="wrap" alignItems="center" mt={0.5}>
                <Box display="flex" alignItems="center" mr={2}>
                  <TimerIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                  <Typography variant="body2" color="textSecondary">
                    {duration}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" mr={2}>
                  <Typography variant="body2" color="textSecondary">
                    {format(startTime, 'MMM d, yyyy')}
                  </Typography>
                  <Box mx={1}>•</Box>
                  <Typography variant="body2" color="textSecondary">
                    {format(startTime, 'h:mm a')} - {endTime ? format(endTime, 'h:mm a') : 'Now'}
                  </Typography>
                </Box>
                
                {!endTime && (
                  <Chip 
                    label="In Progress" 
                    size="small" 
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
            
            <Box>
              <IconButton
                aria-label="more"
                aria-controls="entry-menu"
                aria-haspopup="true"
                onClick={handleClick}
                size="small"
              >
                <MoreVertIcon />
              </IconButton>
              
              <Menu
                id="entry-menu"
                anchorEl={anchorEl}
                keepMounted
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                {!isActive && !endTime && (
                  <MenuItem onClick={handleStart}>
                    <ListItemIcon>
                      <StartIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Continue" />
                  </MenuItem>
                )}
                
                {isActive && (
                  <MenuItem onClick={handleStop}>
                    <ListItemIcon>
                      <StopIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Stop" />
                  </MenuItem>
                )}
                
                <MenuItem onClick={handleEdit}>
                  <ListItemIcon>
                    <EditIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Edit" />
                </MenuItem>
                
                <MenuItem onClick={handleDelete}>
                  <ListItemIcon>
                    <DeleteIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText primary="Delete" primaryTypographyProps={{ color: 'error' }} />
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

// Helper function to calculate duration between two dates
const calculateDuration = (start, end) => {
  if (!start || !end) return '0h 0m';
  
  const diffMs = end - start;
  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;
  
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
};

export default TimeEntryItem;
