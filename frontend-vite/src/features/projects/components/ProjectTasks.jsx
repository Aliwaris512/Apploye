import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Flag as FlagIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  PauseCircle as PauseCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

// Sample team members - in a real app, this would come from props or context
const teamMembers = [
  { id: 1, name: 'John Doe', avatar: 'JD' },
  { id: 2, name: 'Jane Smith', avatar: 'JS' },
  { id: 3, name: 'Mike Johnson', avatar: 'MJ' },
  { id: 4, name: 'Sarah Williams', avatar: 'SW' },
];

// Sample tasks - in a real app, this would come from props
const sampleTasks = [
  {
    id: 1,
    title: 'Design homepage layout',
    description: 'Create wireframes and mockups for the homepage',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2023-08-15',
    assignee: 2, // Jane Smith
    completed: false,
  },
  {
    id: 2,
    title: 'Implement user authentication',
    description: 'Set up JWT authentication and protected routes',
    status: 'not_started',
    priority: 'high',
    dueDate: '2023-08-20',
    assignee: 1, // John Doe
    completed: false,
  },
  {
    id: 3,
    title: 'Optimize database queries',
    description: 'Review and optimize slow database queries',
    status: 'completed',
    priority: 'medium',
    dueDate: '2023-08-10',
    assignee: 3, // Mike Johnson
    completed: true,
  },
];

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'success' },
  { value: 'medium', label: 'Medium', color: 'warning' },
  { value: 'high', label: 'High', color: 'error' },
];

const statusOptions = [
  { value: 'not_started', label: 'Not Started', icon: <CancelIcon />, color: 'error' },
  { value: 'in_progress', label: 'In Progress', icon: <PauseCircleIcon />, color: 'warning' },
  { value: 'completed', label: 'Completed', icon: <CheckCircleIcon />, color: 'success' },
];

const ProjectTasks = ({ projectId }) => {
  const theme = useTheme();
  const [tasks, setTasks] = useState(sampleTasks);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'not_started',
    priority: 'medium',
    dueDate: null,
    assignee: '',
  });

  // Handle menu open
  const handleMenuOpen = (event, task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  // Handle dialog open for new task
  const handleOpenDialog = () => {
    setEditingTask(null);
    setTaskForm({
      title: '',
      description: '',
      status: 'not_started',
      priority: 'medium',
      dueDate: null,
      assignee: '',
    });
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTask(null);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskForm({
      ...taskForm,
      [name]: value,
    });
  };

  // Handle date change
  const handleDateChange = (date) => {
    setTaskForm({
      ...taskForm,
      dueDate: date,
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingTask) {
      // Update existing task
      setTasks(
        tasks.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                ...taskForm,
                dueDate: taskForm.dueDate ? format(taskForm.dueDate, 'yyyy-MM-dd') : null,
              }
            : task
        )
      );
    } else {
      // Add new task
      const newTask = {
        id: tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1,
        ...taskForm,
        dueDate: taskForm.dueDate ? format(taskForm.dueDate, 'yyyy-MM-dd') : null,
        completed: taskForm.status === 'completed',
      };
      setTasks([...tasks, newTask]);
    }
    
    handleCloseDialog();
  };

  // Handle task status toggle
  const handleTaskToggle = (taskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              status: !task.completed ? 'completed' : 'not_started',
            }
          : task
      )
    );
  };

  // Handle edit task
  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      assignee: task.assignee || '',
    });
    setOpenDialog(true);
  };

  // Handle delete task
  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter((task) => task.id !== taskId));
      handleMenuClose();
    }
  };

  // Get assignee name by ID
  const getAssigneeName = (assigneeId) => {
    const member = teamMembers.find((m) => m.id === assigneeId);
    return member ? member.name : 'Unassigned';
  };

  // Get status info
  const getStatusInfo = (status) => {
    return statusOptions.find((s) => s.value === status) || statusOptions[0];
  };

  // Get priority info
  const getPriorityInfo = (priority) => {
    return priorityOptions.find((p) => p.value === priority) || priorityOptions[1];
  };

  // Filter tasks by status
  const notStartedTasks = tasks.filter((task) => task.status === 'not_started');
  const inProgressTasks = tasks.filter((task) => task.status === 'in_progress');
  const completedTasks = tasks.filter((task) => task.status === 'completed');

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" component="h2">
          Project Tasks
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Add Task
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Not Started */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CancelIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">To Do</Typography>
                <Chip
                  label={notStartedTasks.length}
                  size="small"
                  sx={{ ml: 'auto' }}
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                {notStartedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleTaskToggle}
                    onMenuOpen={handleMenuOpen}
                    getAssigneeName={getAssigneeName}
                    getStatusInfo={getStatusInfo}
                    getPriorityInfo={getPriorityInfo}
                  />
                ))}
                {notStartedTasks.length === 0 && (
                  <Typography variant="body2" color="text.secondary" align="center" py={2}>
                    No tasks in this section
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* In Progress */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PauseCircleIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">In Progress</Typography>
                <Chip
                  label={inProgressTasks.length}
                  size="small"
                  sx={{ ml: 'auto' }}
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                {inProgressTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleTaskToggle}
                    onMenuOpen={handleMenuOpen}
                    getAssigneeName={getAssigneeName}
                    getStatusInfo={getStatusInfo}
                    getPriorityInfo={getPriorityInfo}
                  />
                ))}
                {inProgressTasks.length === 0 && (
                  <Typography variant="body2" color="text.secondary" align="center" py={2}>
                    No tasks in this section
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Completed */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Completed</Typography>
                <Chip
                  label={completedTasks.length}
                  size="small"
                  sx={{ ml: 'auto' }}
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleTaskToggle}
                    onMenuOpen={handleMenuOpen}
                    getAssigneeName={getAssigneeName}
                    getStatusInfo={getStatusInfo}
                    getPriorityInfo={getPriorityInfo}
                  />
                ))}
                {completedTasks.length === 0 && (
                  <Typography variant="body2" color="text.secondary" align="center" py={2}>
                    No tasks in this section
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Task Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  margin="dense"
                  id="title"
                  name="title"
                  label="Task Title"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={taskForm.title}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  id="description"
                  name="description"
                  label="Description"
                  type="text"
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  value={taskForm.description}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status"
                    name="status"
                    value={taskForm.status}
                    label="Status"
                    onChange={handleInputChange}
                    required
                  >
                    {statusOptions.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        <Box display="flex" alignItems="center">
                          {status.icon}
                          <Box component="span" ml={1}>
                            {status.label}
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel id="priority-label">Priority</InputLabel>
                  <Select
                    labelId="priority-label"
                    id="priority"
                    name="priority"
                    value={taskForm.priority}
                    label="Priority"
                    onChange={handleInputChange}
                    required
                  >
                    {priorityOptions.map((priority) => (
                      <MenuItem key={priority.value} value={priority.value}>
                        <Box display="flex" alignItems="center">
                          <Box
                            component="span"
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: `${priority.color}.main`,
                              mr: 1,
                            }}
                          />
                          {priority.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Due Date"
                      value={taskForm.dueDate}
                      onChange={handleDateChange}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </LocalizationProvider>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel id="assignee-label">Assignee</InputLabel>
                  <Select
                    labelId="assignee-label"
                    id="assignee"
                    name="assignee"
                    value={taskForm.assignee}
                    label="Assignee"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">
                      <em>Unassigned</em>
                    </MenuItem>
                    {teamMembers.map((member) => (
                      <MenuItem key={member.id} value={member.id}>
                        {member.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingTask ? 'Update Task' : 'Add Task'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Task Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
      >
        <MenuItem onClick={() => handleEditTask(selectedTask)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDeleteTask(selectedTask?.id)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ color: 'error' }}>
            Delete
          </ListItemText>
        </MenuItem>
        {selectedTask?.status !== 'completed' && (
          <MenuItem
            onClick={() =>
              handleTaskToggle(selectedTask?.id)
            }
          >
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText>Mark as Completed</ListItemText>
          </MenuItem>
        )}
        {selectedTask?.status === 'not_started' && (
          <MenuItem
            onClick={() => {
              setTasks(
                tasks.map((task) =>
                  task.id === selectedTask.id
                    ? { ...task, status: 'in_progress' }
                    : task
                )
              );
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <PauseCircleIcon fontSize="small" color="warning" />
            </ListItemIcon>
            <ListItemText>Mark as In Progress</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

// Task Item Component
const TaskItem = ({
  task,
  onToggle,
  onMenuOpen,
  getAssigneeName,
  getStatusInfo,
  getPriorityInfo,
}) => {
  const statusInfo = getStatusInfo(task.status);
  const priorityInfo = getPriorityInfo(task.priority);

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 1,
        borderLeft: `4px solid ${statusInfo.color}.main`,
        '&:hover': {
          boxShadow: 1,
        },
      }}
    >
      <Box display="flex" alignItems="flex-start" p={1.5}>
        <Box display="flex" alignItems="center" mr={1}>
          <Checkbox
            edge="start"
            checked={task.completed}
            tabIndex={-1}
            disableRipple
            onClick={(e) => e.stopPropagation()}
            onChange={() => onToggle(task.id)}
            inputProps={{ 'aria-labelledby': `task-${task.id}` }}
            sx={{ p: 0.5 }}
          />
        </Box>
        
        <Box flexGrow={1} minWidth={0} onClick={() => onToggle(task.id)} sx={{ cursor: 'pointer' }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 'medium',
              textDecoration: task.completed ? 'line-through' : 'none',
              color: task.completed ? 'text.secondary' : 'text.primary',
            }}
            noWrap
          >
            {task.title}
          </Typography>
          
          <Box display="flex" alignItems="center" flexWrap="wrap" mt={0.5} gap={1}>
            <Chip
              size="small"
              label={priorityInfo.label}
              color={priorityInfo.color}
              variant="outlined"
              sx={{ height: 20, fontSize: '0.65rem' }}
            />
            
            {task.dueDate && (
              <Box display="flex" alignItems="center" ml={0.5}>
                <CalendarIcon fontSize="inherit" color="action" sx={{ fontSize: '0.9rem', mr: 0.25 }} />
                <Typography variant="caption" color="text.secondary">
                  {new Date(task.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Typography>
              </Box>
            )}
            
            {task.assignee && (
              <Box display="flex" alignItems="center" ml={0.5}>
                <PersonIcon fontSize="inherit" color="action" sx={{ fontSize: '0.9rem', mr: 0.25 }} />
                <Typography variant="caption" color="text.secondary">
                  {getAssigneeName(task.assignee).split(' ')[0]}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
        
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onMenuOpen(e, task);
          }}
          sx={{ ml: 0.5 }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Box>
    </Card>
  );
};

export default ProjectTasks;
