import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Typography,
  CircularProgress,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';

const TimeEntryForm = ({
  open,
  onClose,
  onSubmit,
  projects = [],
  initialData = {},
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    projectId: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(),
  });

  // Initialize form with initialData when it changes
  useEffect(() => {
    if (initialData.id) {
      setFormData({
        projectId: initialData.projectId || '',
        description: initialData.description || '',
        startTime: initialData.startTime 
          ? parseISO(initialData.startTime)
          : new Date(),
        endTime: initialData.endTime 
          ? parseISO(initialData.endTime)
          : new Date(),
      });
    } else {
      // Reset form for new entry
      setFormData({
        projectId: '',
        description: '',
        startTime: new Date(),
        endTime: new Date(),
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (name) => (date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate end time is after start time
    if (formData.endTime <= formData.startTime) {
      alert('End time must be after start time');
      return;
    }
    
    // Format dates for API
    const formattedData = {
      ...formData,
      startTime: format(formData.startTime, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
      endTime: format(formData.endTime, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
    };
    
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData.id ? 'Edit Time Entry' : 'Add New Time Entry'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="project-label">Project</InputLabel>
                <Select
                  labelId="project-label"
                  id="projectId"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  label="Project"
                >
                  <MenuItem value="">
                    <em>Select a project</em>
                  </MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                id="description"
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
                required
              />
            </Grid>
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label="Start Time"
                  value={formData.startTime}
                  onChange={handleDateChange('startTime')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="normal"
                      required
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label="End Time"
                  value={formData.endTime}
                  onChange={handleDateChange('endTime')}
                  minDateTime={formData.startTime}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="normal"
                      required
                    />
                  )}
                />
              </Grid>
            </LocalizationProvider>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Duration: {calculateDuration(formData.startTime, formData.endTime)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            color="primary" 
            variant="contained"
            disabled={isLoading || !formData.projectId}
          >
            {isLoading ? (
              <CircularProgress size={24} />
            ) : initialData.id ? (
              'Update Entry'
            ) : (
              'Add Entry'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// Helper function to calculate duration between two dates
const calculateDuration = (start, end) => {
  if (!start || !end) return '0h 0m';
  
  const diffMs = end - start;
  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;
  
  return `${hours}h ${minutes}m`;
};

export default TimeEntryForm;
