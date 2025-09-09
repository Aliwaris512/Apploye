import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Avatar,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Menu,
  MenuItem,
  Typography,
  Paper,
  Tooltip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  Switch,
  Badge,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  PersonOff as PersonOffIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  Email as EmailIcon,
  Group as GroupIcon,
  GroupAdd as GroupAddIcon,
  PersonRemove as PersonRemoveIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

// Sample data - in a real app, this would come from props/API
const allUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'developer', avatar: 'JD' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'designer', avatar: 'JS' },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'manager', avatar: 'MJ' },
  { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', role: 'developer', avatar: 'SW' },
  { id: 5, name: 'David Brown', email: 'david@example.com', role: 'qa', avatar: 'DB' },
  { id: 6, name: 'Emily Davis', email: 'emily@example.com', role: 'designer', avatar: 'ED' },
];

const roleOptions = [
  { value: 'admin', label: 'Admin', description: 'Full access to all project settings and data' },
  { value: 'manager', label: 'Manager', description: 'Can manage tasks and team members' },
  { value: 'developer', label: 'Developer', description: 'Can work on assigned tasks' },
  { value: 'designer', label: 'Designer', description: 'Can upload and manage design assets' },
  { value: 'qa', label: 'QA Tester', description: 'Can test and report issues' },
  { value: 'viewer', label: 'Viewer', description: 'Can view project details only' },
];

const TeamManagement = ({ projectId }) => {
  const theme = useTheme();
  const [teamMembers, setTeamMembers] = useState([
    { ...allUsers[0], role: 'admin', joinedAt: '2023-01-15' },
    { ...allUsers[1], role: 'designer', joinedAt: '2023-02-20' },
    { ...allUsers[2], role: 'manager', joinedAt: '2023-02-25' },
  ]);
  
  const [availableUsers, setAvailableUsers] = useState(
    allUsers.filter(user => !teamMembers.some(member => member.id === user.id))
  );
  
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('developer');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Handle menu open
  const handleMenuOpen = (event, member) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  // Filter team members based on search
  const filteredTeamMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm) ||
    member.email.toLowerCase().includes(searchTerm) ||
    member.role.toLowerCase().includes(searchTerm)
  );

  // Handle add team member dialog open
  const handleOpenAddDialog = () => {
    setSelectedUsers([]);
    setSelectedRole('developer');
    setOpenAddDialog(true);
  };

  // Handle add team member dialog close
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setSelectedUsers([]);
    setSelectedRole('developer');
    setError('');
  };

  // Toggle user selection
  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Add team members
  const handleAddTeamMembers = () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one team member');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newMembers = allUsers
        .filter(user => selectedUsers.includes(user.id))
        .map(user => ({
          ...user,
          role: selectedRole,
          joinedAt: new Date().toISOString().split('T')[0]
        }));
      
      setTeamMembers([...teamMembers, ...newMembers]);
      setAvailableUsers(availableUsers.filter(user => !selectedUsers.includes(user.id)));
      setLoading(false);
      setOpenAddDialog(false);
      setSuccess(`${newMembers.length} team member(s) added successfully`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    }, 1000);
  };

  // Update team member role
  const handleUpdateRole = (memberId, newRole) => {
    setTeamMembers(teamMembers.map(member =>
      member.id === memberId ? { ...member, role: newRole } : member
    ));
    handleMenuClose();
    setSuccess('Team member role updated');
    
    // Clear success message after 5 seconds
    setTimeout(() => setSuccess(''), 5000);
  };

  // Remove team member
  const handleRemoveMember = (memberId) => {
    const member = teamMembers.find(m => m.id === memberId);
    setTeamMembers(teamMembers.filter(m => m.id !== memberId));
    setAvailableUsers([...availableUsers, allUsers.find(u => u.id === memberId)]);
    handleMenuClose();
    setSuccess(`${member.name} removed from the team`);
    
    // Clear success message after 5 seconds
    setTimeout(() => setSuccess(''), 5000);
  };

  // Get role info
  const getRoleInfo = (role) => {
    return roleOptions.find(r => r.value === role) || roleOptions[0];
  };

  // Get role color
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'developer': return 'info';
      case 'designer': return 'secondary';
      case 'qa': return 'success';
      case 'viewer': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h6" component="h2">
            Team Members
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage team members and their permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={handleOpenAddDialog}
        >
          Add Team Member
        </Button>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box mb={3}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                endAdornment: searchTerm && (
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                ),
              }}
            />
          </Box>

          <List>
            {filteredTeamMembers.length > 0 ? (
              filteredTeamMembers.map((member) => (
                <ListItem
                  key={member.id}
                  divider
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="more"
                      onClick={(e) => handleMenuOpen(e, member)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      {member.avatar}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" flexWrap="wrap">
                        <Typography variant="subtitle1" component="span" sx={{ mr: 1 }}>
                          {member.name}
                        </Typography>
                        <Chip
                          label={getRoleInfo(member.role).label}
                          size="small"
                          color={getRoleColor(member.role)}
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                        {member.role === 'admin' && (
                          <Tooltip title="Project Admin">
                            <AdminPanelSettingsIcon
                              fontSize="small"
                              color="error"
                              sx={{ ml: 0.5 }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          display="block"
                        >
                          {member.email}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          Joined on {new Date(member.joinedAt).toLocaleDateString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <Box py={4} textAlign="center">
                <PersonOffIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  {searchTerm
                    ? 'No team members match your search'
                    : 'No team members found'}
                </Typography>
              </Box>
            )}
          </List>
        </CardContent>
      </Card>

      {/* Team Member Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
      >
        <MenuItem disabled>
          <ListItemText primary="Change Role" />
        </MenuItem>
        {roleOptions.map((role) => (
          <MenuItem
            key={role.value}
            onClick={() => handleUpdateRole(selectedMember.id, role.value)}
            selected={selectedMember?.role === role.value}
            disabled={selectedMember?.role === 'admin'}
          >
            <ListItemIcon>
              {selectedMember?.role === role.value ? (
                <CheckIcon color="primary" />
              ) : (
                <SecurityIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText
              primary={role.label}
              secondary={role.description}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </MenuItem>
        ))}
        <Divider />
        <MenuItem
          onClick={() => handleRemoveMember(selectedMember?.id)}
          disabled={selectedMember?.role === 'admin'}
        >
          <ListItemIcon>
            <PersonRemoveIcon color="error" fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Remove from Team" primaryTypographyProps={{ color: 'error' }} />
        </MenuItem>
      </Menu>

      {/* Add Team Member Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Team Members</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              value={selectedRole}
              label="Role"
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {roleOptions.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Available Team Members ({availableUsers.length})
          </Typography>
          
          {availableUsers.length > 0 ? (
            <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
              <List dense>
                {availableUsers.map((user) => (
                  <ListItem
                    key={user.id}
                    button
                    onClick={() => toggleUserSelection(user.id)}
                    selected={selectedUsers.includes(user.id)}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={selectedUsers.includes(user.id)}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ 'aria-labelledby': `user-${user.id}` }}
                      />
                    </ListItemIcon>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        {user.avatar}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={user.email}
                      secondaryTypographyProps={{ noWrap: true }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          ) : (
            <Box py={4} textAlign="center">
              <GroupOffIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="body1" color="text.secondary">
                No available team members to add
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button
            onClick={handleAddTeamMembers}
            variant="contained"
            disabled={selectedUsers.length === 0 || loading}
          >
            {loading ? 'Adding...' : `Add ${selectedUsers.length} Member(s)`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamManagement;
