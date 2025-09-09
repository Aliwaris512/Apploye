import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions, 
  IconButton, 
  Tooltip,
  Skeleton,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Chip,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Fullscreen as FullscreenIcon, 
  Download as DownloadIcon, 
  MoreVert as MoreIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

const ScreenshotGallery = ({ screenshots = [], loading = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedScreenshotForMenu, setSelectedScreenshotForMenu] = useState(null);
  
  // Handle screenshot click
  const handleScreenshotClick = (screenshot) => {
    setSelectedScreenshot(screenshot);
    setZoom(1);
  };
  
  // Handle close dialog
  const handleCloseDialog = () => {
    setSelectedScreenshot(null);
    setZoom(1);
  };
  
  // Handle menu open
  const handleMenuOpen = (event, screenshot) => {
    setAnchorEl(event.currentTarget);
    setSelectedScreenshotForMenu(screenshot);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedScreenshotForMenu(null);
  };
  
  // Handle download
  const handleDownload = (screenshot) => {
    if (!screenshot) return;
    
    const link = document.createElement('a');
    link.href = screenshot.imageUrl;
    link.download = `screenshot-${screenshot.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleMenuClose();
  };
  
  // Handle zoom in/out
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };
  
  // Handle reset zoom
  const handleResetZoom = () => {
    setZoom(1);
  };
  
  // Render loading state
  if (loading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item}>
            <Skeleton variant="rectangular" height={200} />
            <Skeleton width="60%" height={24} sx={{ mt: 1 }} />
            <Skeleton width="40%" height={20} />
          </Grid>
        ))}
      </Grid>
    );
  }
  
  // Render empty state
  if (!screenshots.length) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight={300}
        textAlign="center"
        p={3}
        border={1}
        borderColor="divider"
        borderRadius={1}
      >
        <InfoIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          No screenshots found
        </Typography>
        <Typography variant="body2" color="textSecondary">
          No screenshots were captured for the selected time period.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      <Grid container spacing={2}>
        {screenshots.map((screenshot) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={screenshot.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              <Box sx={{ position: 'relative', pt: '56.25%' }}>
                <CardMedia
                  component="img"
                  image={screenshot.thumbnailUrl || screenshot.imageUrl}
                  alt={`Screenshot ${screenshot.id}`}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleScreenshotClick(screenshot)}
                />
                
                {/* Screenshot overlay */}
                <Box 
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    p: 1,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Chip 
                    size="small"
                    label={screenshot.status || 'Active'}
                    color={screenshot.status === 'flagged' ? 'error' : 'default'}
                    sx={{ 
                      color: 'white',
                      bgcolor: screenshot.status === 'flagged' ? 'error.dark' : 'rgba(255, 255, 255, 0.2)',
                      height: 20,
                      '& .MuiChip-label': { px: 1 },
                    }}
                  />
                  
                  <Box display="flex" gap={0.5}>
                    <Tooltip title="View fullscreen">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleScreenshotClick(screenshot);
                        }}
                        sx={{ color: 'white' }}
                      >
                        <FullscreenIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="More options">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, screenshot);
                        }}
                        sx={{ color: 'white' }}
                      >
                        <MoreIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
              
              <CardContent sx={{ flexGrow: 1, p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box display="flex" alignItems="center" mb={0.5}>
                  <Avatar 
                    src={screenshot.user?.avatar} 
                    alt={screenshot.user?.name}
                    sx={{ width: 24, height: 24, mr: 1 }}
                  >
                    <PersonIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="body2" noWrap>
                    {screenshot.user?.name || 'Unknown User'}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" color="text.secondary">
                  <TimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                  <Typography variant="caption">
                    {format(parseISO(screenshot.timestamp), 'MMM d, yyyy h:mm a')}
                  </Typography>
                </Box>
                
                {screenshot.title && (
                  <Typography variant="body2" sx={{ mt: 1 }} noWrap>
                    {screenshot.title}
                  </Typography>
                )}
              </CardContent>
              
              <CardActions sx={{ p: 1, pt: 0, justifyContent: 'space-between' }}>
                <Box display="flex" gap={0.5}>
                  <Chip 
                    label={screenshot.type || 'screenshot'} 
                    size="small" 
                    variant="outlined"
                  />
                </Box>
                
                <Box display="flex" gap={0.5}>
                  <Tooltip title="Download">
                    <IconButton 
                      size="small" 
                      onClick={() => handleDownload(screenshot)}
                      color="primary"
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Screenshot Dialog */}
      <Dialog
        open={!!selectedScreenshot}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        {selectedScreenshot && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar 
                  src={selectedScreenshot.user?.avatar} 
                  alt={selectedScreenshot.user?.name}
                  sx={{ width: 32, height: 32 }}
                >
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {selectedScreenshot.user?.name || 'Unknown User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {format(parseISO(selectedScreenshot.timestamp), 'MMM d, yyyy h:mm a')}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <IconButton onClick={handleCloseDialog}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            
            <DialogContent 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                p: 2,
                overflow: 'hidden',
                position: 'relative',
                minHeight: 300,
              }}
            >
              <Box
                component="img"
                src={selectedScreenshot.imageUrl}
                alt={`Screenshot ${selectedScreenshot.id}`}
                sx={{
                  maxWidth: '100%',
                  maxHeight: 'calc(100vh - 200px)',
                  objectFit: 'contain',
                  transform: `scale(${zoom})`,
                  transition: 'transform 0.2s',
                }}
              />
            </DialogContent>
            
            <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
              <Box display="flex" gap={1}>
                <Button 
                  variant="outlined" 
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                >
                  Zoom Out
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleResetZoom}
                  disabled={zoom === 1}
                >
                  Reset
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                >
                  Zoom In
                </Button>
              </Box>
              
              <Box display="flex" gap={1}>
                <Button 
                  variant="contained" 
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownload(selectedScreenshot)}
                >
                  Download
                </Button>
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Screenshot Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
      >
        <MenuItem onClick={() => handleDownload(selectedScreenshotForMenu)}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        
        <MenuItem>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem>
          <ListItemIcon>
            <StarBorderIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add to favorites</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ScreenshotGallery;
