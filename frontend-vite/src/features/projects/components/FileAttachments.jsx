import React, { useState, useRef } from 'react';
import {
  Box, Button, Card, CardContent, CardHeader, Divider, Grid, IconButton,
  List, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, Typography,
  Paper, Tooltip, LinearProgress, Alert, TextField, InputAdornment, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  Select, Avatar, Badge, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import {
  AttachFile, CloudUpload, InsertDriveFile, Image, PictureAsPdf, Description,
  Code, MoreVert, Delete, Download, Visibility, Edit, Search, Close,
  Folder, FolderOpen, CreateNewFolder, Star, StarBorder, Share, Link
} from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';

// Sample data
const sampleFiles = [
  { id: '1', name: 'project-brief.pdf', size: 2456789, type: 'pdf', uploadedBy: 'John Doe', uploadedAt: '2023-07-15T10:30:00Z', isStarred: true },
  { id: '2', name: 'design.sketch', size: 3456789, type: 'sketch', uploadedBy: 'Jane Smith', uploadedAt: '2023-07-16T14:45:00Z', isStarred: false },
  { id: '3', name: 'user-flow.png', size: 123456, type: 'image', uploadedBy: 'Mike Johnson', uploadedAt: '2023-07-17T09:15:00Z', isStarred: true },
  { id: '4', name: 'style-guide.pdf', size: 1890000, type: 'pdf', uploadedBy: 'Jane Smith', uploadedAt: '2023-07-18T11:20:00Z', isStarred: false },
  { id: '5', name: 'specs.docx', size: 876543, type: 'doc', uploadedBy: 'John Doe', uploadedAt: '2023-07-19T16:30:00Z', isStarred: false },
];

const fileIcons = {
  pdf: <PictureAsPdf color="error" />,
  doc: <Description color="primary" />,
  docx: <Description color="primary" />,
  jpg: <Image color="primary" />,
  png: <Image color="primary" />,
  gif: <Image color="primary" />,
  sketch: <Image color="secondary" />,
  zip: <FolderOpen color="action" />,
  default: <InsertDriveFile color="action" />,
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  return fileIcons[ext] || fileIcons.default;
};

const FileAttachments = ({ projectId }) => {
  const [files, setFiles] = useState(sampleFiles);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [view, setView] = useState('grid');
  const fileInputRef = useRef(null);

  const handleMenuOpen = (event, file) => {
    setAnchorEl(event.currentTarget);
    setSelectedFile(file);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFile(null);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setProgress(0);

    // Simulate upload
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      
      const newFiles = selectedFiles.map((file, index) => ({
        id: `new-${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.name.split('.').pop().toLowerCase(),
        uploadedBy: 'You',
        uploadedAt: new Date().toISOString(),
        isStarred: false,
      }));

      setFiles([...files, ...newFiles]);
      setUploading(false);
      setProgress(0);
    }, 2000);
  };

  const toggleStar = (fileId) => {
    setFiles(files.map(file => 
      file.id === fileId ? { ...file, isStarred: !file.isStarred } : file
    ));
  };

  const handleDelete = () => {
    if (selectedFile && window.confirm(`Delete ${selectedFile.name}?`)) {
      setFiles(files.filter(f => f.id !== selectedFile.id));
      handleMenuClose();
    }
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h6">Files</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage project files and documents
          </Typography>
        </Box>
        <Box>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(e, v) => v && setView(v)}
            size="small"
            sx={{ mr: 2 }}
          >
            <ToggleButton value="grid">Grid</ToggleButton>
            <ToggleButton value="list">List</ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={handleUploadClick}
            disabled={uploading}
          >
            Upload
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            multiple
          />
        </Box>
      </Box>

      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search color="action" sx={{ mr: 1 }} />,
            endAdornment: searchTerm && (
              <IconButton size="small" onClick={() => setSearchTerm('')}>
                <Close fontSize="small" />
              </IconButton>
            ),
          }}
        />
      </Box>

      {uploading && (
        <Box mb={3}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Uploading...
          </Typography>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      )}

      {view === 'grid' ? (
        <Grid container spacing={2}>
          {filteredFiles.map((file) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={file.id}>
              <Card>
                <Box p={2} textAlign="center">
                  <Box sx={{ fontSize: 40, mb: 1 }}>
                    {getFileIcon(file.name)}
                  </Box>
                  <Typography noWrap>{file.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(file.size)}
                  </Typography>
                </Box>
                <Divider />
                <Box p={1} display="flex" justifyContent="space-between" alignItems="center">
                  <Tooltip title={file.uploadedBy}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                      {file.uploadedBy.charAt(0)}
                    </Avatar>
                  </Tooltip>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => toggleStar(file.id)}
                    >
                      {file.isStarred ? (
                        <Star color="warning" fontSize="small" />
                      ) : (
                        <StarBorder fontSize="small" />
                      )}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, file)}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <List>
            {filteredFiles.map((file) => (
              <ListItem
                key={file.id}
                divider
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={(e) => handleMenuOpen(e, file)}
                  >
                    <MoreVert />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  {getFileIcon(file.name)}
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={`${formatFileSize(file.size)} • ${format(new Date(file.uploadedAt), 'MMM d, yyyy')} • ${file.uploadedBy}`}
                />
                <IconButton
                  size="small"
                  onClick={() => toggleStar(file.id)}
                  sx={{ mr: 1 }}
                >
                  {file.isStarred ? (
                    <Star color="warning" fontSize="small" />
                  ) : (
                    <StarBorder fontSize="small" />
                  )}
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Card>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>Preview</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Link fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Link</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <Delete color="error" fontSize="small" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ color: 'error' }}>
            Delete
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default FileAttachments;
