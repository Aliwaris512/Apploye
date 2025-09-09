import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Button
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Timer as TimerIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { 
  fetchTimeEntries, 
  deleteTimeEntry,
  startTimeEntry,
  stopTimeEntry,
  selectAllTimeEntries,
  selectTimeTrackingStatus,
  selectTimeTrackingError,
  selectCurrentTimeEntry
} from './timeTrackingSlice';

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':');
};

const TimeEntriesList = ({ 
  projectId,
  userId,
  showHeader = true,
  showPagination = true,
  pageSize = 10
}) => {
  const dispatch = useDispatch();
  const entries = useSelector(selectAllTimeEntries);
  const status = useSelector(selectTimeTrackingStatus);
  const error = useSelector(selectTimeTrackingError);
  const currentEntry = useSelector(selectCurrentTimeEntry);
  
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(pageSize);
  
  const loading = status === 'loading';
  
  useEffect(() => {
    const params = {};
    if (projectId) params.projectId = projectId;
    if (userId) params.userId = userId;
    
    dispatch(fetchTimeEntries({
      ...params,
      limit: rowsPerPage,
      offset: page * rowsPerPage
    }));
  }, [dispatch, projectId, userId, page, rowsPerPage]);
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleDeleteEntry = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this time entry?')) {
      await dispatch(deleteTimeEntry(entryId));
    }
  };
  
  const handleStartEntry = async (entry) => {
    if (currentEntry) {
      // If there's already a running timer, stop it first
      await dispatch(stopTimeEntry(currentEntry.id));
    }
    
    // Start a new time entry with the same details
    await dispatch(startTimeEntry({
      projectId: entry.projectId,
      description: entry.description
    }));
  };
  
  const handleStopEntry = async (entry) => {
    if (entry.id === currentEntry?.id) {
      await dispatch(stopTimeEntry(entry.id));
    }
  };
  
  const isEntryRunning = (entry) => {
    return currentEntry?.id === entry.id && !entry.endTime;
  };
  
  if (loading && entries.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">
          Error loading time entries: {error}
        </Typography>
      </Box>
    );
  }
  
  if (entries.length === 0) {
    return (
      <Box p={2} textAlign="center">
        <Typography variant="body1" color="textSecondary">
          No time entries found
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      {showHeader && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            Time Entries
          </Typography>
        </Box>
      )}
      
      <TableContainer component={Paper} elevation={0} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              {!projectId && <TableCell>Project</TableCell>}
              <TableCell>Description</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry) => {
              const isRunning = isEntryRunning(entry);
              const startDate = entry.startTime ? parseISO(entry.startTime) : null;
              const endDate = entry.endTime ? parseISO(entry.endTime) : null;
              const duration = entry.duration || 
                (startDate && !endDate ? 
                  Math.floor((new Date() - startDate) / 1000) : 0);
              
              return (
                <TableRow 
                  key={entry.id}
                  hover
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    bgcolor: isRunning ? 'action.hover' : 'inherit'
                  }}
                >
                  <TableCell>
                    {startDate && (
                      <Box>
                        <div>{format(startDate, 'MMM d, yyyy')}</div>
                        <div style={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                          {format(startDate, 'h:mm a')}
                          {endDate ? ` - ${format(endDate, 'h:mm a')}` : ''}
                        </div>
                      </Box>
                    )}
                  </TableCell>
                  
                  {!projectId && (
                    <TableCell>
                      {entry.project?.name || 'No project'}
                    </TableCell>
                  )}
                  
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {entry.description || 'No description'}
                      </Typography>
                      {startDate && (
                        <Typography variant="caption" color="textSecondary">
                          {formatDistanceToNow(startDate, { addSuffix: true })}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip 
                      label={formatDuration(duration)}
                      size="small"
                      color={isRunning ? 'primary' : 'default'}
                      icon={isRunning ? <TimerIcon fontSize="small" /> : null}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Chip 
                      label={isRunning ? 'In Progress' : 'Completed'}
                      size="small"
                      color={isRunning ? 'primary' : 'default'}
                      variant={isRunning ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      {isRunning ? (
                        <Tooltip title="Stop timer">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleStopEntry(entry)}
                            disabled={status === 'loading'}
                          >
                            <StopIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Start timer">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleStartEntry(entry)}
                            disabled={status === 'loading'}
                          >
                            <PlayIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      <Tooltip title="Edit">
                        <IconButton size="small" disabled={status === 'loading'}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteEntry(entry.id)}
                          disabled={status === 'loading'}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      {showPagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={entries.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Box>
  );
};

export default TimeEntriesList;
