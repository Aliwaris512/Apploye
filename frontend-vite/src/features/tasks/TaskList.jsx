import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Button, Card, CardContent, Checkbox, Chip, Divider, List,
  ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton,
  TextField, Typography, Paper, InputAdornment
} from '@mui/material';
import {
  Add as AddIcon, MoreVert as MoreVertIcon, Search as SearchIcon,
  Flag as PriorityIcon, Person as AssigneeIcon, CalendarToday as DueDateIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { fetchProjectTasks, updateTask } from './taskSlice';

const TaskList = ({ projectId }) => {
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state) => state.tasks);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch tasks when projectId changes
  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectTasks(projectId));
    }
  }, [dispatch, projectId]);

  // Toggle task status
  const handleToggleStatus = async (taskId, currentStatus) => {
    await dispatch(updateTask({
      id: taskId,
      status: currentStatus === 'completed' ? 'pending' : 'completed'
    }));
  };

  if (loading) return <Box p={2}><Typography>Loading tasks...</Typography></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          placeholder="Search tasks..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1 }}
        />
        <Button variant="contained" startIcon={<AddIcon />}>
          Add Task
        </Button>
      </Box>

      <Paper>
        <List>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <React.Fragment key={task.id}>
                <ListItemButton>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={task.status === 'completed'}
                      onChange={() => handleToggleStatus(task.id, task.status)}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                        }}
                      >
                        {task.title}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                        {task.dueDate && (
                          <Chip
                            icon={<DueDateIcon />}
                            label={format(parseISO(task.dueDate), 'MMM d')}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
                <Divider />
              </React.Fragment>
            ))
          ) : (
            <Box p={3} textAlign="center">
              <Typography color="text.secondary">
                No tasks found
              </Typography>
            </Box>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default TaskList;
