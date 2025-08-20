import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Container, 
  Typography, 
  Box, 
  Avatar, 
  TextField, 
  Button, 
  Paper,
  Divider,
  Grid,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate passwords if changing
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        throw new Error("New passwords don't match");
      }

      // Prepare update data
      const updateData = {
        name: formData.name,
        ...(formData.newPassword && {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      };

      const result = await updateProfile(updateData);
      
      if (result?.success) {
        setSuccess('Profile updated successfully');
        setEditMode(false);
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        throw new Error(result?.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating your profile');
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Profile Settings
          </Typography>
          {!editMode ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <Box>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => setEditMode(false)}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </Box>
          )}
        </Box>

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
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: '3rem',
                  mb: 2,
                  bgcolor: 'primary.main'
                }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Typography variant="h6" align="center">
                {user.name || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                {user.email || 'user@example.com'}
              </Typography>
            </Grid>

            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!editMode}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!editMode}
                    margin="normal"
                  />
                </Grid>
              </Grid>

              {editMode && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Change Password
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    margin="normal"
                    helperText="Leave blank to keep current password"
                  />
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    margin="normal"
                    disabled={!formData.newPassword}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
