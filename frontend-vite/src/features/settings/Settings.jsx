import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, Divider,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
  Grid, Avatar, IconButton, Tabs, Tab, useTheme, useMediaQuery
} from '@mui/material';
import {
  Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon,
  VpnKey as VpnKeyIcon, Delete as DeleteIcon, Edit as EditIcon,
  Save as SaveIcon, Cancel as CancelIcon, DarkMode as DarkModeIcon,
  LightMode as LightModeIcon, Language as LanguageIcon, Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon, Security as SecurityIcon
} from '@mui/icons-material';

// Sample user data
const userData = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'admin',
  phone: '+1 (555) 123-4567',
  company: 'Acme Inc.',
  position: 'Project Manager',
  timezone: 'America/New_York',
  language: 'en',
  theme: 'light',
  emailNotifications: true,
  pushNotifications: true,
  twoFactorAuth: false,
};

// Available languages
const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
];

// Available timezones
const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
];

// Settings tabs
const settingsTabs = [
  { id: 'account', label: 'Account', icon: <PersonIcon /> },
  { id: 'notifications', label: 'Notifications', icon: <NotificationsIcon /> },
  { id: 'security', label: 'Security', icon: <SecurityIcon /> },
  { id: 'appearance', label: 'Appearance', icon: <DarkModeIcon /> },
];

const Settings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState('account');
  const [user, setUser] = useState(userData);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    company: user.company,
    position: user.position,
    timezone: user.timezone,
    language: user.language,
    theme: user.theme,
    emailNotifications: user.emailNotifications,
    pushNotifications: user.pushNotifications,
    twoFactorAuth: user.twoFactorAuth,
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle save changes
  const handleSaveChanges = () => {
    setUser(prev => ({
      ...prev,
      ...formData
    }));
    setIsEditing(false);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      company: user.company,
      position: user.position,
      timezone: user.timezone,
      language: user.language,
      theme: user.theme,
      emailNotifications: user.emailNotifications,
      pushNotifications: user.pushNotifications,
      twoFactorAuth: user.twoFactorAuth,
    });
    setIsEditing(false);
  };

  // Render account settings
  const renderAccountSettings = () => (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">Account Information</Typography>
          {!isEditing ? (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSaveChanges}
              >
                Save Changes
              </Button>
            </Box>
          )}
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: 48,
                  mb: 2,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText'
                }}
              >
                {user.name.charAt(0)}
              </Avatar>
              <Typography variant="h6">{user.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Account Actions
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<VpnKeyIcon />}
                sx={{ mb: 1 }}
              >
                Change Password
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
              >
                Delete Account
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Job Title"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" disabled={!isEditing}>
                  <InputLabel>Time Zone</InputLabel>
                  <Select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    label="Time Zone"
                  >
                    {timezones.map((tz) => (
                      <MenuItem key={tz} value={tz}>
                        {tz}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" disabled={!isEditing}>
                  <InputLabel>Language</InputLabel>
                  <Select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    label="Language"
                    startAdornment={
                      <InputAdornment position="start">
                        <LanguageIcon color="action" />
                      </InputAdornment>
                    }
                  >
                    {languages.map((lang) => (
                      <MenuItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Render notification settings
  const renderNotificationSettings = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Notification Preferences
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.emailNotifications}
                onChange={handleInputChange}
                name="emailNotifications"
                color="primary"
              />
            }
            label={
              <Box>
                <Typography>Email Notifications</Typography>
                <Typography variant="body2" color="text.secondary">
                  Receive email notifications for important updates
                </Typography>
              </Box>
            }
            sx={{ mb: 2, display: 'block' }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={formData.pushNotifications}
                onChange={handleInputChange}
                name="pushNotifications"
                color="primary"
              />
            }
            label={
              <Box>
                <Typography>Push Notifications</Typography>
                <Typography variant="body2" color="text.secondary">
                  Receive push notifications on this device
                </Typography>
              </Box>
            }
            sx={{ mb: 2, display: 'block' }}
          />
        </Box>
      </CardContent>
    </Card>
  );

  // Render security settings
  const renderSecuritySettings = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Security Settings
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography>Two-Factor Authentication</Typography>
              <Typography variant="body2" color="text.secondary">
                Add an extra layer of security to your account
              </Typography>
            </Box>
            <Switch
              checked={formData.twoFactorAuth}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  twoFactorAuth: e.target.checked
                }));
              }}
              color="primary"
            />
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<VpnKeyIcon />}
            onClick={() => {}}
          >
            Change Password
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  // Render appearance settings
  const renderAppearanceSettings = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Appearance
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <FormControl component="fieldset">
            <Typography variant="subtitle1" gutterBottom>
              Theme
            </Typography>
            <Box display="flex" gap={2} mb={3}>
              <Button
                variant={formData.theme === 'light' ? 'contained' : 'outlined'}
                startIcon={<LightModeIcon />}
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    theme: 'light'
                  }));
                }}
              >
                Light
              </Button>
              <Button
                variant={formData.theme === 'dark' ? 'contained' : 'outlined'}
                startIcon={<DarkModeIcon />}
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    theme: 'dark'
                  }));
                }}
              >
                Dark
              </Button>
            </Box>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Language</InputLabel>
            <Select
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              label="Language"
              startAdornment={
                <InputAdornment position="start">
                  <LanguageIcon color="action" />
                </InputAdornment>
              }
            >
              {languages.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  {lang.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </CardContent>
    </Card>
  );

  // Render active tab content
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'account':
        return renderAccountSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'appearance':
        return renderAppearanceSettings();
      default:
        return renderAccountSettings();
    }
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your account settings and preferences
        </Typography>
      </Box>
      
      <Card>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
          aria-label="settings tabs"
        >
          {settingsTabs.map((tab) => (
            <Tab 
              key={tab.id} 
              value={tab.id} 
              label={isMobile ? null : tab.label}
              icon={tab.icon}
              iconPosition={isMobile ? 'top' : 'start'}
            />
          ))}
        </Tabs>
        
        <Divider />
        
        <Box p={3}>
          {renderActiveTab()}
        </Box>
      </Card>
    </Box>
  );
};

export default Settings;
