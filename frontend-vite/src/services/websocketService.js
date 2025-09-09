import { WS_ENDPOINTS } from '../config/apiEndpoints';
import { getAuthToken } from '../utils/auth';
import { handleApiError } from '../utils/apiErrorHandler';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.maxReconnectDelay = 30000; // Max 30 seconds
    this.isConnected = false;
    this.onConnectCallbacks = [];
    this.onDisconnectCallbacks = [];
  }

  /**
   * Connect to the WebSocket server
   */
  connect() {
    if (this.socket) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      console.warn('No auth token available for WebSocket connection');
      return;
    }

    try {
      // Add token as a query parameter for authentication
      const url = new URL(WS_ENDPOINTS.BASE);
      url.searchParams.append('token', token);
      
      this.socket = new WebSocket(url.toString());
      this.setupEventListeners();
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.handleReconnect();
    }
  }

  /**
   * Set up WebSocket event listeners
   */
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      
      // Notify all connection callbacks
      this.onConnectCallbacks.forEach(callback => callback());
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleIncomingMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error, event.data);
      }
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.isConnected = false;
      this.socket = null;
      
      // Notify all disconnection callbacks
      this.onDisconnectCallbacks.forEach(callback => callback(event));
      
      // Attempt to reconnect if this wasn't a normal closure
      if (event.code !== 1000) {
        this.handleReconnect();
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  /**
   * Handle reconnection logic with exponential backoff
   */
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect();
      }
    }, delay);
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'User initiated disconnect');
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Subscribe to a specific channel/topic
   * @param {string} channel - The channel/topic to subscribe to
   * @param {Function} callback - The callback to invoke when a message is received
   */
  subscribe(channel, callback) {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    
    this.subscriptions.get(channel).add(callback);
    
    // If connected, send subscription message to server
    if (this.isConnected) {
      this.send({
        type: 'SUBSCRIBE',
        channel,
      });
    }
    
    // Return unsubscribe function
    return () => this.unsubscribe(channel, callback);
  }

  /**
   * Unsubscribe from a specific channel/topic
   * @param {string} channel - The channel/topic to unsubscribe from
   * @param {Function} callback - The callback to remove
   */
  unsubscribe(channel, callback) {
    if (!this.subscriptions.has(channel)) return;
    
    const channelSubscriptions = this.subscriptions.get(channel);
    channelSubscriptions.delete(callback);
    
    if (channelSubscriptions.size === 0) {
      this.subscriptions.delete(channel);
      
      // If connected, send unsubscribe message to server
      if (this.isConnected) {
        this.send({
          type: 'UNSUBSCRIBE',
          channel,
        });
      }
    }
  }

  /**
   * Send a message through the WebSocket
   * @param {Object} message - The message to send
   */
  send(message) {
    if (!this.isConnected || !this.socket) {
      console.warn('Cannot send message - WebSocket not connected');
      return false;
    }
    
    try {
      this.socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }

  /**
   * Handle incoming WebSocket messages
   * @param {Object} message - The received message
   */
  handleIncomingMessage(message) {
    if (!message || !message.type) {
      console.warn('Received invalid WebSocket message:', message);
      return;
    }

    // Handle different message types
    switch (message.type) {
      case 'NOTIFICATION':
        this.handleNotification(message);
        break;
      case 'CHAT_MESSAGE':
        this.handleChatMessage(message);
        break;
      case 'PROJECT_UPDATE':
        this.handleProjectUpdate(message);
        break;
      case 'TASK_UPDATE':
        this.handleTaskUpdate(message);
        break;
      case 'PING':
        this.handlePing(message);
        break;
      default:
        console.warn('Received unknown message type:', message.type);
    }
  }

  // Specific message handlers
  handleNotification(notification) {
    const callbacks = this.subscriptions.get('notifications') || [];
    callbacks.forEach(callback => callback(notification));
  }

  handleChatMessage(message) {
    const channel = `chat:${message.channelId}`;
    const callbacks = this.subscriptions.get(channel) || [];
    callbacks.forEach(callback => callback(message));
  }

  handleProjectUpdate(update) {
    const channel = `project:${update.projectId}`;
    const callbacks = this.subscriptions.get(channel) || [];
    callbacks.forEach(callback => callback(update));
  }

  handleTaskUpdate(update) {
    const channel = `task:${update.taskId}`;
    const callbacks = this.subscriptions.get(channel) || [];
    callbacks.forEach(callback => callback(update));
    
    // Also notify project subscribers
    if (update.projectId) {
      const projectChannel = `project:${update.projectId}`;
      const projectCallbacks = this.subscriptions.get(projectChannel) || [];
      projectCallbacks.forEach(callback => callback(update));
    }
  }

  handlePing() {
    // Respond to ping with pong
    this.send({ type: 'PONG' });
  }

  // Connection state management
  onConnect(callback) {
    if (typeof callback === 'function') {
      this.onConnectCallbacks.push(callback);
      
      // If already connected, invoke immediately
      if (this.isConnected) {
        callback();
      }
      
      // Return cleanup function
      return () => {
        this.onConnectCallbacks = this.onConnectCallbacks.filter(cb => cb !== callback);
      };
    }
    return () => {};
  }

  onDisconnect(callback) {
    if (typeof callback === 'function') {
      this.onDisconnectCallbacks.push(callback);
      
      // Return cleanup function
      return () => {
        this.onDisconnectCallbacks = this.onDisconnectCallbacks.filter(cb => cb !== callback);
      };
    }
    return () => {};
  }
}

// Export a singleton instance
export const webSocketService = new WebSocketService();

// Auto-connect when the module is loaded
if (typeof window !== 'undefined') {
  // Only connect in browser environment
  const token = getAuthToken();
  if (token) {
    webSocketService.connect();
  }
}

export default webSocketService;
