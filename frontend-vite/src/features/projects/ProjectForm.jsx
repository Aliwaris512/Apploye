import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Dialog, DialogActions,
  DialogContent, DialogTitle, FormControl, InputLabel,
  MenuItem, Select, FormHelperText, Grid, Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const ProjectForm = ({ 
  open, 
  onClose, 
  onSubmit, 
  project = null,
  loading = false,
  error = null
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client: '',
    status: 'active',
    startDate: new Date(),
    dueDate: null,
    managerId: '',
  });

  // Set form data when editing a project
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        client: project.client || '',
        status: project.status || 'active',
        startDate: project.startDate ? new Date(project.startDate) : new Date(),
        dueDate: project.dueDate ? new Date(project.dueDate) : null,
        managerId: project.managerId || '',
      });
    } else {
      // Reset form for new project
      setFormData({
        name: '',
        description: '',
        client: '',
        status: 'active',
        startDate: new Date(),
        dueDate: null,
        managerId: '',
      });
    }
  }, [project, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {project ? 'Edit Project' : 'Create New Project'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                name="name"
                label="Project Name"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.name}
                onChange={handleChange}
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
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="client"
                name="client"
                label="Client"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.client}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formData.status}
                  label="Status"
                  onChange={handleChange}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="paused">Paused</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) => handleDateChange(date, 'startDate')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="dense"
                      required
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Due Date"
                  value={formData.dueDate}
                  onChange={(date) => handleDateChange(date, 'dueDate')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="dense"
                    />
                  )}
                  minDate={formData.startDate}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="manager-label">Project Manager</InputLabel>
                <Select
                  labelId="manager-label"
                  id="managerId"
                  name="managerId"
                  value={formData.managerId}
                  label="Project Manager"
                  onChange={handleChange}
                >
                  <MenuItem value="">
                    <em>Unassigned</em>
                  </MenuItem>
                  {/* TODO: Populate with actual managers */}
                  <MenuItem value="1">John Doe</MenuItem>
                  <MenuItem value="2">Jane Smith</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProjectForm;
