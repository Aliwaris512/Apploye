import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  TextField, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
  Collapse,
  Divider,
  Stack,
  Chip,
  Avatar
} from '@mui/material';
import { 
  PlayArrow as StartIcon, 
  Stop as StopIcon,
  Timer as TimerIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  AccessTime as TimeIcon,
  Assignment as ProjectIcon,
  Notes as DescriptionIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { format, parseISO, differenceInSeconds, formatDistanceToNow } from 'date-fns';
import { useSnackbar } from 'notistack';
import { 
  startTimeEntry, 
  stopTimeEntry, 
  createTimeEntry, 
  updateTimeEntry,
  selectCurrentTimeEntry,
  selectTimeTrackingStatus,
  selectTimeTrackingError,
  clearTimeTrackingError
} from './timeTrackingSlice';
import { selectProjects } from '../projects/projectSlice';

const formatDuration = (seconds, showSeconds = true) => {
  if (!seconds && seconds !== 0) return showSeconds ? '00:00:00' : '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (showSeconds) {
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  } else {
    return [
      hours > 0 ? `${hours}h` : '',
      minutes > 0 || hours > 0 ? `${minutes}m` : '0m'
    ].filter(Boolean).join(' ');
  }
};

const Timer = () => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const currentEntry = useSelector(selectCurrentTimeEntry);
  const status = useSelector(selectTimeTrackingStatus);
  const error = useSelector(selectTimeTrackingError);
  const projectsState = useSelector(selectProjects);
  const projects = Array.isArray(projectsState) ? projectsState : [];
  
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [showValidation, setShowValidation] = useState(false);
  
  const timerRef = useRef(null);
  const descriptionRef = useRef(null);
  const projectRef = useRef(null);
  
  // Find the current project
  const currentProject = Array.isArray(projects) ? (projects.find(p => p.id === projectId) || {}) : {};
  
  // Show error message if there's an error
  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
      dispatch(clearTimeTrackingError());
    }
  }, [error, enqueueSnackbar, dispatch]);
  
  // Initialize timer with current entry if it exists
  useEffect(() => {
    if (currentEntry) {
      setDescription(currentEntry.description || '');
      setProjectId(currentEntry.projectId || '');
      
      if (currentEntry.startTime && !currentEntry.endTime) {
        const start = parseISO(currentEntry.startTime);
        setStartTime(start);
        startTimer(start);
        // Auto-expand when there's an active timer
        setIsExpanded(true);
      } else {
        resetTimer();
      }
    } else {
      resetTimer();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentEntry]);
  
  // Auto-focus description field when expanded
  useEffect(() => {
    if (isExpanded && descriptionRef.current) {
      descriptionRef.current.focus();
    }
  }, [isExpanded]);
  
  const startTimer = useCallback((start) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setStartTime(start);
    
    timerRef.current = setInterval(() => {
      const now = new Date();
      const diffInSeconds = differenceInSeconds(now, start);
      setElapsedTime(diffInSeconds);
    }, 1000);
  }, []);
  
  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setStartTime(null);
    setElapsedTime(0);
    setDescription('');
    setProjectId('');
    setShowValidation(false);
  }, []);
  
  const validateForm = () => {
    const isValid = !!description.trim() && !!projectId;
    setShowValidation(!isValid);
    return isValid;
  };
  
  const handleStart = () => {
    if (!validateForm()) return;
    
    const timeEntryData = {
      description: description.trim(),
      projectId,
      startTime: new Date().toISOString(),
    };
    
    if (currentEntry?.id) {
      dispatch(updateTimeEntry({ id: currentEntry.id, ...timeEntryData }));
    } else {
      dispatch(createTimeEntry(timeEntryData));
      enqueueSnackbar('Time tracking started', { variant: 'success' });
    }
  };
  
  const handleStop = () => {
    if (!currentEntry?.id) return;
    
    const now = new Date().toISOString();
    dispatch(updateTimeEntry({ 
      id: currentEntry.id, 
      endTime: now 
    }));
    
    enqueueSnackbar('Time entry saved', { variant: 'success' });
    resetTimer();
    setIsExpanded(false);
  };
  
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const renderTimerControls = () => (
    <Box sx={{ mt: 2 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <Typography variant="h4" component="div" sx={{ fontFamily: 'monospace', minWidth: 120 }}>
            {formatDuration(elapsedTime, true)}
          </Typography>
          
          {startTime && (
            <Chip 
              label={`Started ${formatDistanceToNow(startTime, { addSuffix: true })}`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ ml: 2 }}
              icon={<TimeIcon />}
            />
          )}
        </Box>
        
        <Box>
          {!startTime ? (
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={status === 'loading' ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <StartIcon />
              )}
              onClick={handleStart}
              disabled={status === 'loading'}
              sx={{ minWidth: 120 }}
            >
              Start
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={status === 'loading' ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <StopIcon />
              )}
              onClick={handleStop}
              disabled={status === 'loading'}
              sx={{ minWidth: 120 }}
            >
              Stop
            </Button>
          )}
        </Box>
      </Box>
      
      {showValidation && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Please fill in all required fields
        </Alert>
      )}
    </Box>
  );
  
  const renderTimerForm = () => (
    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
      <Box sx={{ mt: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="What are you working on?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={status === 'loading'}
          sx={{ mb: 2 }}
          inputRef={descriptionRef}
          error={showValidation && !description.trim()}
          helperText={showValidation && !description.trim() ? 'Description is required' : ''}
          InputProps={{
            startAdornment: <DescriptionIcon color="action" sx={{ mr: 1 }} />
          }}
        />
        
        <FormControl 
          fullWidth 
          variant="outlined" 
          sx={{ mb: 2 }}
          error={showValidation && !projectId}
        >
          <InputLabel id="project-select-label">Project</InputLabel>
          <Select
            labelId="project-select-label"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            label="Project"
            disabled={status === 'loading'}
            startAdornment={<ProjectIcon />}
            inputRef={projectRef}
          >
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => setIsExpanded(false)}
            disabled={status === 'loading'}
            startIcon={<CloseIcon />}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleStart}
            disabled={status === 'loading' || !description.trim() || !projectId}
            startIcon={<StartIcon />}
          >
            Start Timer
          </Button>
        </Box>
      </Box>
    </Collapse>
  );

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" flexGrow={1}>
          <TimerIcon color="primary" sx={{ mr: 2 }} />
          {currentEntry ? (
            <Box flexGrow={1}>
              <Typography variant="subtitle1" noWrap>
                {currentEntry.description || 'No description'}
              </Typography>
              <Box display="flex" alignItems="center" mt={0.5}>
                <Chip
                  label={currentProject?.name || 'No project'}
                  size="small"
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  Started {formatDistanceToNow(parseISO(currentEntry.startTime))} ago
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography variant="subtitle1" color="text.secondary">
              No active timer
            </Typography>
          )}
        </Box>
        
        <Box display="flex" alignItems="center">
          <Typography variant="h5" component="div" sx={{ minWidth: 100, textAlign: 'right', mr: 2, fontFamily: 'monospace' }}>
            {formatDuration(elapsedTime, true)}
          </Typography>
          
          {currentEntry ? (
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={handleStop}
              disabled={status === 'loading'}
              startIcon={<StopIcon />}
            >
              Stop
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => setIsExpanded(!isExpanded)}
              startIcon={<StartIcon />}
            >
              New Timer
            </Button>
          )}
        </Box>
      </Box>
      
      {renderTimerForm()}
      
      {showValidation && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Please fill in all required fields
        </Alert>
      )}
    </Paper>
  );
};

export default Timer;
