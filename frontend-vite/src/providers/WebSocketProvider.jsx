import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { webSocketService } from '../services/websocketService';
import { 
  connectWebSocket, 
  disconnectWebSocket, 
  selectIsConnected,
  selectError
} from '../features/websocket/websocketSlice';
import { useSnackbar } from 'notistack';

/**
 * WebSocketProvider component that manages the WebSocket connection
 * and provides WebSocket functionality to child components.
 */
const WebSocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const isConnected = useSelector(selectIsConnected);
  const error = useSelector(selectError);
  const { enqueueSnackbar } = useSnackbar();

  // Handle connection state changes
  useEffect(() => {
    // Connect to WebSocket when the component mounts
    dispatch(connectWebSocket());

    // Clean up on unmount
    return () => {
      dispatch(disconnectWebSocket());
    };
  }, [dispatch]);

  // Show error notifications
  useEffect(() => {
    if (error) {
      enqueueSnackbar(`WebSocket Error: ${error}`, { 
        variant: 'error',
        autoHideDuration: 5000,
      });
    }
  }, [error, enqueueSnackbar]);

  // Handle reconnection when the auth token changes
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'token') {
        if (event.newValue) {
          // Token was set - connect
          if (!isConnected) {
            dispatch(connectWebSocket());
          }
        } else {
          // Token was removed - disconnect
          if (isConnected) {
            dispatch(disconnectWebSocket());
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [dispatch, isConnected]);

  // No need to render anything, this is a provider component
  return children;
};

export default WebSocketProvider;

/**
 * Higher-Order Component to provide WebSocket functionality to class components
 * @param {React.Component} WrappedComponent - The component to wrap with WebSocket functionality
 * @returns {React.Component} - The wrapped component with WebSocket props
 */
export const withWebSocket = (WrappedComponent) => {
  return (props) => {
    const dispatch = useDispatch();
    const isConnected = useSelector(selectIsConnected);
    const error = useSelector(selectError);

    const sendMessage = useCallback((channel, message) => {
      return webSocketService.send({
        ...message,
        channel,
        timestamp: new Date().toISOString(),
      });
    }, []);

    const subscribe = useCallback((channel, callback) => {
      return webSocketService.subscribe(channel, callback);
    }, []);

    const unsubscribe = useCallback((channel, callback) => {
      webSocketService.unsubscribe(channel, callback);
    }, []);

    return (
      <WrappedComponent
        {...props}
        isWebSocketConnected={isConnected}
        webSocketError={error}
        sendWebSocketMessage={sendMessage}
        subscribeToWebSocket={subscribe}
        unsubscribeFromWebSocket={unsubscribe}
      />
    );
  };
};
