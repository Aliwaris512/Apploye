import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, IconButton, Tooltip,
  useTheme, Paper, Divider, TextField, MenuItem, FormControl,
  InputLabel, Select, Checkbox, Dialog, DialogTitle, DialogContent,
  DialogActions, LinearProgress, Chip, Zoom, Fab, useMediaQuery
} from '@mui/material';
import {
  Timeline as TimelineIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, Person as PersonIcon,
  CheckCircle as CheckCircleIcon, RadioButtonUnchecked as RadioButtonUncheckedIcon,
  ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon, Today as TodayViewIcon,
  ViewWeek as ViewWeekIcon, ViewMonth as ViewMonthIcon, FilterList as FilterListIcon,
  Refresh as RefreshIcon, ArrowBackIos as ArrowBackIosIcon,
  ArrowForwardIos as ArrowForwardIosIcon
} from '@mui/icons-material';
import { format, addDays, subDays, isSameDay, isWithinInterval, parseISO } from 'date-fns';

// Sample data
const sampleTasks = [
  {
    id: 'task-1', name: 'Project Kickoff',
    startDate: '2023-09-01', endDate: '2023-09-05',
    progress: 100, assignee: 'John Doe',
    dependencies: [], status: 'completed', priority: 'high'
  },
  {
    id: 'task-2', name: 'Requirements',
    startDate: '2023-09-06', endDate: '2023-09-15',
    progress: 80, assignee: 'Jane Smith',
    dependencies: ['task-1'], status: 'in-progress', priority: 'high'
  },
  {
    id: 'task-3', name: 'UI/UX Design',
    startDate: '2023-09-16', endDate: '2023-10-05',
    progress: 30, assignee: 'Mike Johnson',
    dependencies: ['task-2'], status: 'in-progress', priority: 'medium'
  }
];

// Helper functions
const generateDateRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  return dates;
};

const getDayWidth = (zoomLevel) => {
  return zoomLevel === 'month' ? 10 : zoomLevel === 'week' ? 25 : 40;
};

const formatDateLabel = (date, zoomLevel) => {
  return zoomLevel === 'month' ? format(date, 'MMM yyyy') :
         zoomLevel === 'week' ? `${format(date, 'd')}-${format(addDays(date, 6), 'd MMM')}` :
         format(date, 'd MMM');
};

const GanttChart = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tasks, setTasks] = useState(sampleTasks);
  const [zoomLevel, setZoomLevel] = useState('week');
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 7),
    end: addDays(new Date(), 30),
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  
  const dates = generateDateRange(dateRange.start, dateRange.end);
  const dayWidth = getDayWidth(zoomLevel);
  const timelineWidth = dates.length * dayWidth;

  const handleAddTask = () => {
    setSelectedTask({
      id: `task-${Date.now()}`,
      name: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      progress: 0,
      assignee: 'John Doe',
      dependencies: [],
      status: 'not-started',
      priority: 'medium',
    });
    setOpenTaskDialog(true);
  };

  const handleSaveTask = () => {
    if (selectedTask) {
      setTasks(prev => [...prev, selectedTask]);
      setOpenTaskDialog(false);
    }
  };

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h6">Project Timeline</Typography>
          <Typography variant="body2" color="text.secondary">
            Visualize and manage your project schedule
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddTask}
            size={isMobile ? 'small' : 'medium'}
          >
            Add Task
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Box overflow="auto" py={2}>
            <Box minWidth={timelineWidth} height={400} position="relative">
              {/* Timeline header */}
              <Box display="flex" mb={2} borderBottom="1px solid" borderColor="divider">
                <Box width={200} flexShrink={0} px={2}>
                  <Typography variant="subtitle2">Tasks</Typography>
                </Box>
                <Box display="flex">
                  {dates.map((date, index) => (
                    <Box
                      key={index}
                      width={dayWidth}
                      textAlign="center"
                      borderRight="1px solid"
                      borderColor="divider"
                      py={1}
                    >
                      <Typography variant="caption">
                        {formatDateLabel(date, zoomLevel)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Tasks */}
              {tasks.map((task, index) => (
                <Box key={task.id} display="flex" alignItems="center" py={1}>
                  <Box width={200} flexShrink={0} px={2}>
                    <Typography noWrap>{task.name}</Typography>
                  </Box>
                  <Box position="relative" height={40} flexGrow={1}>
                    <Box
                      position="absolute"
                      left={100}
                      width={200}
                      height={24}
                      bgcolor="primary.light"
                      borderRadius={1}
                      display="flex"
                      alignItems="center"
                      px={1}
                    >
                      <Typography variant="caption" color="white" noWrap>
                        {task.name}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Task Dialog */}
      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedTask?.id ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Box pt={2}>
              <TextField
                fullWidth
                label="Task Name"
                value={selectedTask.name}
                onChange={(e) => setSelectedTask({...selectedTask, name: e.target.value})}
                margin="normal"
              />
              <Box display="flex" gap={2} mt={2}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={selectedTask.startDate}
                  onChange={(e) => setSelectedTask({...selectedTask, startDate: e.target.value})}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={selectedTask.endDate}
                  onChange={(e) => setSelectedTask({...selectedTask, endDate: e.target.value})}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Box>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedTask.status}
                  onChange={(e) => setSelectedTask({...selectedTask, status: e.target.value})}
                >
                  <MenuItem value="not-started">Not Started</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="blocked">Blocked</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveTask} variant="contained" color="primary">
            Save Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GanttChart;
