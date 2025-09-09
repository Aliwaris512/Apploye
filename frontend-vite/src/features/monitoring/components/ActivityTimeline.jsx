import React, { useMemo } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Paper, 
  Divider, 
  Chip,
  Skeleton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Work as WorkIcon, 
  Web as WebIcon, 
  Laptop as AppIcon, 
  MoreVert as MoreIcon,
  AccessTime as TimeIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from '@mui/lab';

const ActivityTimeline = ({ activities = [], loading = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Group activities by date
  const groupedActivities = useMemo(() => {
    if (!activities.length) return [];
    
    const groups = {};
    
    activities.forEach(activity => {
      const date = format(parseISO(activity.timestamp), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });
    
    return Object.entries(groups).map(([date, items]) => ({
      date,
      items: items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    }));
  }, [activities]);
  
  // Get icon based on activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'app':
        return <AppIcon />;
      case 'website':
        return <WebIcon />;
      case 'work':
        return <WorkIcon />;
      default:
        return <WorkIcon />;
    }
  };
  
  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return '0m';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box>
        {[1, 2, 3].map((item) => (
          <Box key={item} mb={3}>
            <Skeleton variant="text" width={120} height={30} sx={{ mb: 1 }} />
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Skeleton variant="rectangular" height={80} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={80} />
            </Paper>
          </Box>
        ))}
      </Box>
    );
  }
  
  // Render empty state
  if (!groupedActivities.length) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight={200}
        textAlign="center"
        p={3}
      >
        <TimeIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          No activities found
        </Typography>
        <Typography variant="body2" color="textSecondary">
          No activities were recorded for the selected time period.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      {groupedActivities.map((group, groupIndex) => (
        <Box key={group.date} mb={4}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {format(parseISO(group.date), 'EEEE, MMMM d, yyyy')}
          </Typography>
          
          <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            <Timeline position={isMobile ? 'right' : 'alternate'} sx={{ p: 0, m: 0 }}>
              {group.items.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <TimelineItem 
                    sx={{
                      '&:before': {
                        display: 'none'
                      },
                      p: 0
                    }}
                  >
                    <TimelineSeparator>
                      <TimelineDot color="primary" variant="outlined">
                        {getActivityIcon(activity.type)}
                      </TimelineDot>
                      {index < group.items.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    
                    <TimelineContent sx={{ py: 2, px: 2 }}>
                      <Box 
                        display="flex" 
                        justifyContent="space-between"
                        alignItems="flex-start"
                        flexWrap="wrap"
                        gap={1}
                        mb={0.5}
                      >
                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                          <Typography variant="subtitle2" component="span">
                            {activity.title || 'Untitled Activity'}
                          </Typography>
                          
                          {activity.project && (
                            <Chip 
                              label={activity.project.name} 
                              size="small" 
                              variant="outlined"
                              color="primary"
                            />
                          )}
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box display="flex" alignItems="center" color="text.secondary">
                            <TimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="caption">
                              {format(parseISO(activity.timestamp), 'h:mm a')}
                            </Typography>
                          </Box>
                          
                          {activity.duration && (
                            <Box display="flex" alignItems="center" color="text.secondary">
                              <TimerIcon fontSize="small" sx={{ mr: 0.5 }} />
                              <Typography variant="caption">
                                {formatDuration(activity.duration)}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                      
                      {activity.description && (
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {activity.description}
                        </Typography>
                      )}
                      
                      {activity.details && (
                        <Box 
                          component="pre" 
                          sx={{ 
                            bgcolor: 'action.hover', 
                            p: 1, 
                            borderRadius: 1, 
                            fontSize: '0.75rem',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            m: 0,
                            mt: 1
                          }}
                        >
                          {JSON.stringify(activity.details, null, 2)}
                        </Box>
                      )}
                    </TimelineContent>
                  </TimelineItem>
                </React.Fragment>
              ))}
            </Timeline>
          </Paper>
        </Box>
      ))}
    </Box>
  );
};

export default ActivityTimeline;
