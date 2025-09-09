import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Pause as PauseIcon,
  Timer as TimerIcon,
  Description as TaskIcon,
  Work as ProjectIcon,
  AccessTime as TimeEntryIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { startTimer, pauseTimer, stopTimer, fetchActiveTimer } from './timeTrackerSlice';

const TimeTracker = () => {
  const dispatch = useDispatch();
  const { activeTimer, loading, error } = useSelector((state) => state.timeTracker);
  const { projects } = useSelector((state) => state.projects);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [description, setDescription] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Fetch active timer on component mount
  useEffect(() => {
    dispatch(fetchActiveTimer());
  }, [dispatch]);

  // Update timer display
  useEffect(() => {
    let interval;
    
    if (activeTimer && activeTimer.isRunning) {
      const startTime = parseISO(activeTimer.startTime);
      const updateElapsedTime = () => {
        const now = new Date();
        setElapsedTime(Math.floor((now - startTime) / 1000));
      };
      
      updateElapsedTime();
      interval = setInterval(updateElapsedTime, 1000);
      setIsRunning(true);
    } else {
      setIsRunning(false);
      if (activeTimer) {
        setElapsedTime(activeTimer.elapsedTime || 0);
      }
    }
    
    return () => clearInterval(interval);
  }, [activeTimer]);

  // Format seconds to HH:MM:SS
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    return [
      h.toString().padStart(2, '0'),
      m.toString().padStart(2, '0'),
      s.toString().padStart(2, '0')
    ].join(':');
  };

  const handleStartTimer = () => {
    if (!selectedProject) {
      // Show error or validation message
      return;
    }
    
    dispatch(startTimer({
      projectId: selectedProject,
      taskId: selectedTask || null,
      description: description || '',
    }));
  };

  const handlePauseTimer = () => {
    if (activeTimer) {
      dispatch(pauseTimer(activeTimer.id));
    }
  };

  const handleStopTimer = () => {
    if (activeTimer) {
      dispatch(stopTimer(activeTimer.id));
      // Reset form
      setSelectedTask('');
      setDescription('');
    }
  };

  // Get tasks for the selected project
  const projectTasks = selectedProject 
    ? projects.find(p => p.id === selectedProject)?.tasks || []
    : [];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <TimerIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h6" component="h2">
            Time Tracker
          </Typography>
        </Box>
        
        {error && (
          <Box mb={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
        
        {!activeTimer ? (
          // No active timer - show start form
          <Box>
            <FormControl fullWidth margin="normal">
              <InputLabel id="project-select-label">Project</InputLabel>
              <Select
                labelId="project-select-label"
                id="project-select"
                value={selectedProject}
                label="Project"
                onChange={(e) => setSelectedProject(e.target.value)}
                required
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="task-select-label">Task (Optional)</InputLabel>
              <Select
                labelId="task-select-label"
                id="task-select"
                value={selectedTask}
                label="Task (Optional)"
                onChange={(e) => setSelectedTask(e.target.value)}
                disabled={!selectedProject}
              >
                {projectTasks.map((task) => (
                  <MenuItem key={task.id} value={task.id}>
                    {task.title}
                  </MenuItem>
                ))}
                <MenuItem value="">
                  <em>No specific task</em>
                </MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              margin="normal"
              label="Description (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
            />
            
            <Box mt={3} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                startIcon={<StartIcon />}
                onClick={handleStartTimer}
                disabled={!selectedProject || loading}
              >
                Start Tracking
              </Button>
            </Box>
          </Box>
        ) : (
          // Active timer - show timer controls
          <Box>
            <Box textAlign="center" mb={3}>
              <Typography variant="h3">
                {formatTime(elapsedTime)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {activeTimer.description || 'No description'}
              </Typography>
              <Box mt={1}>
                <Chip
                  icon={<ProjectIcon />}
                  label={activeTimer.project?.name || 'No project'}
                  size="small"
                  sx={{ mr: 1 }}
                />
                {activeTimer.task && (
                  <Chip
                    icon={<TaskIcon />}
                    label={activeTimer.task.title}
                    size="small"
                    color="secondary"
                  />
                )}
              </Box>
            </Box>
            
            <Box display="flex" justifyContent="center" gap={2}>
              {isRunning ? (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<PauseIcon />}
                  onClick={handlePauseTimer}
                  disabled={loading}
                >
                  Pause
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<StartIcon />}
                  onClick={handleStartTimer}
                  disabled={loading}
                >
                  Resume
                </Button>
              )}
              
              <Button
                variant="contained"
                color="secondary"
                startIcon={<StopIcon />}
                onClick={handleStopTimer}
                disabled={loading}
              >
                Stop
              </Button>
            </Box>
            
            {activeTimer.startTime && (
              <Box mt={2} textAlign="center">
                <Typography variant="caption" color="textSecondary">
                  Started {formatDistanceToNow(parseISO(activeTimer.startTime))} ago
                </Typography>
              </Box>
            )}
          </Box>
        )}
        
        {/* Recent time entries */}
        <Box mt={4}>
          <Typography variant="subtitle1" gutterBottom>
            <TimeEntryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Recent Entries
          </Typography>
          <Divider />
          
          {activeTimer?.recentEntries?.length > 0 ? (
            <List>
              {activeTimer.recentEntries.map((entry) => (
                <ListItem key={entry.id} divider>
                  <ListItemText
                    primary={entry.description || 'No description'}
                    secondary={`${format(parseISO(entry.startTime), 'MMM d, yyyy hh:mm a')} • ${formatTime(entry.duration)}`}
                  />
                  <ListItemSecondaryAction>
                    <Typography variant="body2" color="textSecondary">
                      {entry.project?.name}
                    </Typography>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box py={2} textAlign="center">
              <Typography variant="body2" color="textSecondary">
                No recent time entries
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TimeTracker;
