import { useState, useEffect, useCallback } from 'react';
import { webSocketService } from '../services/websocketService';

/**
 * Hook to manage WebSocket subscriptions and handle real-time updates
 * @param {string} channel - The channel/topic to subscribe to
 * @param {Function} onMessage - Callback function to handle incoming messages
 * @param {Array} dependencies - Dependencies for the effect
 * @returns {Object} - WebSocket connection state and utilities
 */
export const useWebSocket = (channel, onMessage, dependencies = []) => {
  const [isConnected, setIsConnected] = useState(webSocketService.isConnected);
  const [error, setError] = useState(null);

  // Handle incoming messages
  const handleMessage = useCallback((message) => {
    try {
      if (onMessage && typeof onMessage === 'function') {
        onMessage(message);
      }
    } catch (err) {
      console.error('Error in WebSocket message handler:', err);
      setError(err);
    }
  }, [onMessage]);

  // Subscribe to the WebSocket channel
  useEffect(() => {
    if (!channel) return;

    // Subscribe to the channel
    const unsubscribe = webSocketService.subscribe(channel, handleMessage);

    // Set up connection state listeners if this is the first hook
    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
      
      // Resubscribe on reconnect
      webSocketService.subscribe(channel, handleMessage);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setError(new Error('Disconnected from server'));
    };

    const cleanupConnect = webSocketService.onConnect(handleConnect);
    const cleanupDisconnect = webSocketService.onDisconnect(handleDisconnect);

    // Initial connection check
    if (webSocketService.isConnected) {
      handleConnect();
    } else {
      // Try to connect if not already connected
      webSocketService.connect();
    }

    // Cleanup on unmount
    return () => {
      unsubscribe();
      cleanupConnect();
      cleanupDisconnect();
    };
  }, [channel, handleMessage, ...dependencies]);

  // Send a message through the WebSocket
  const sendMessage = useCallback((message) => {
    if (!webSocketService.isConnected) {
      setError(new Error('Not connected to WebSocket server'));
      return false;
    }
    return webSocketService.send(message);
  }, []);

  // Reconnect manually if needed
  const reconnect = useCallback(() => {
    webSocketService.connect();
  }, []);

  return {
    isConnected,
    error,
    sendMessage,
    reconnect,
  };
};

/**
 * Hook to subscribe to real-time notifications
 * @param {Function} onNotification - Callback when a notification is received
 * @returns {Object} - Notification state and utilities
 */
export const useNotifications = (onNotification) => {
  return useWebSocket('notifications', onNotification, [onNotification]);
};

/**
 * Hook to subscribe to project updates
 * @param {string} projectId - The ID of the project to subscribe to
 * @param {Function} onUpdate - Callback when an update is received
 * @returns {Object} - Project update state and utilities
 */
export const useProjectUpdates = (projectId, onUpdate) => {
  const channel = projectId ? `project:${projectId}` : null;
  return useWebSocket(channel, onUpdate, [projectId, onUpdate]);
};

/**
 * Hook to subscribe to task updates
 * @param {string} taskId - The ID of the task to subscribe to
 * @param {Function} onUpdate - Callback when an update is received
 * @returns {Object} - Task update state and utilities
 */
export const useTaskUpdates = (taskId, onUpdate) => {
  const channel = taskId ? `task:${taskId}` : null;
  return useWebSocket(channel, onUpdate, [taskId, onUpdate]);
};

/**
 * Hook to subscribe to chat messages
 * @param {string} channelId - The ID of the chat channel to subscribe to
 * @param {Function} onMessage - Callback when a message is received
 * @returns {Object} - Chat state and utilities
 */
export const useChat = (channelId, onMessage) => {
  const channel = channelId ? `chat:${channelId}` : null;
  return useWebSocket(channel, onMessage, [channelId, onMessage]);
};

export default useWebSocket;
