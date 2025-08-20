import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Switch, 
  FormControlLabel, 
  Divider, 
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

const Settings = () => {
  const { user, updateSettings } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    emailReports: true,
    idleThreshold: 5,
    timeFormat: '12h',
    dateFormat: 'MM/DD/YYYY',
    autoStart: true,
    activityTracking: true,
    screenshots: false,
    screenshotInterval: 5
  });

  useEffect(() => {
    if (user?.settings) {
      setSettings(prev => ({
        ...prev,
        ...user.settings
      }));
    }
  }, [user]);

  const handleToggle = (setting) => (event) => {
    setSettings(prev => ({
      ...prev,
      [setting]: event.target.checked
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await updateSettings(settings);
      
      if (result?.success) {
        setSuccess('Settings saved successfully');
        // Reset success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(result?.message || 'Failed to save settings');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while saving settings');
      console.error('Settings update error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Display Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.darkMode}
                    onChange={handleToggle('darkMode')}
                    name="darkMode"
                    color="primary"
                  />
                }
                label="Dark Mode"
                sx={{ display: 'block', mb: 2 }}
              />
              
              <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                <InputLabel id="time-format-label">Time Format</InputLabel>
                <Select
                  labelId="time-format-label"
                  id="time-format"
                  name="timeFormat"
                  value={settings.timeFormat}
                  onChange={handleChange}
                  label="Time Format"
                >
                  <MenuItem value="12h">12-hour (2:30 PM)</MenuItem>
                  <MenuItem value="24h">24-hour (14:30)</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="date-format-label">Date Format</InputLabel>
                <Select
                  labelId="date-format-label"
                  id="date-format"
                  name="dateFormat"
                  value={settings.dateFormat}
                  onChange={handleChange}
                  label="Date Format"
                >
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                </Select>
              </FormControl>
            </Paper>
            
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Notification Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications}
                    onChange={handleToggle('notifications')}
                    name="notifications"
                    color="primary"
                  />
                }
                label="Enable Notifications"
                sx={{ display: 'block', mb: 2 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailReports}
                    onChange={handleToggle('emailReports')}
                    name="emailReports"
                    color="primary"
                    disabled={!settings.notifications}
                  />
                }
                label="Email Weekly Reports"
                sx={{ display: 'block', mb: 2 }}
              />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Activity Tracking
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.activityTracking}
                    onChange={handleToggle('activityTracking')}
                    name="activityTracking"
                    color="primary"
                  />
                }
                label="Enable Activity Tracking"
                sx={{ display: 'block', mb: 2 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.screenshots}
                    onChange={handleToggle('screenshots')}
                    name="screenshots"
                    color="primary"
                    disabled={!settings.activityTracking}
                  />
                }
                label="Enable Screenshots"
                sx={{ display: 'block', mb: 2 }}
              />
              
              <TextField
                fullWidth
                type="number"
                label="Screenshot Interval (minutes)"
                name="screenshotInterval"
                value={settings.screenshotInterval}
                onChange={handleChange}
                margin="normal"
                disabled={!settings.screenshots || !settings.activityTracking}
                inputProps={{ min: 1, max: 60 }}
              />
              
              <TextField
                fullWidth
                type="number"
                label="Idle Threshold (minutes)"
                name="idleThreshold"
                value={settings.idleThreshold}
                onChange={handleChange}
                margin="normal"
                disabled={!settings.activityTracking}
                inputProps={{ min: 1, max: 60 }}
                helperText="Time before considering user as idle"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoStart}
                    onChange={handleToggle('autoStart')}
                    name="autoStart"
                    color="primary"
                  />
                }
                label="Start with System"
                sx={{ display: 'block', mt: 2 }}
              />
            </Paper>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={loading}
          >
            Save Settings
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Settings;
