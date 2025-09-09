import { createSlice } from '@reduxjs/toolkit';
import { webSocketService } from '../../services/websocketService';

const initialState = {
  isConnected: false,
  error: null,
  subscriptions: {},
  messages: {},
};

const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    connectionEstablished: (state) => {
      state.isConnected = true;
      state.error = null;
    },
    connectionLost: (state, action) => {
      state.isConnected = false;
      state.error = action.payload || 'Connection lost';
    },
    subscriptionAdded: (state, action) => {
      const { channel } = action.payload;
      if (!state.subscriptions[channel]) {
        state.subscriptions[channel] = true;
      }
    },
    subscriptionRemoved: (state, action) => {
      const { channel } = action.payload;
      if (state.subscriptions[channel]) {
        delete state.subscriptions[channel];
      }
    },
    messageReceived: (state, action) => {
      const { channel, message } = action.payload;
      if (!state.messages[channel]) {
        state.messages[channel] = [];
      }
      state.messages[channel].push({
        ...message,
        timestamp: new Date().toISOString(),
      });
    },
    clearMessages: (state, action) => {
      const { channel } = action.payload;
      if (channel) {
        state.messages[channel] = [];
      } else {
        state.messages = {};
      }
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  connectionEstablished,
  connectionLost,
  subscriptionAdded,
  subscriptionRemoved,
  messageReceived,
  clearMessages,
  setError,
} = websocketSlice.actions;

// Thunks
export const connectWebSocket = () => (dispatch) => {
  try {
    webSocketService.connect();
    
    // Set up connection listeners
    webSocketService.onConnect(() => {
      dispatch(connectionEstablished());
      
      // Resubscribe to all channels on reconnect
      const { subscriptions } = websocketSlice.getState().websocket;
      Object.keys(subscriptions).forEach(channel => {
        webSocketService.subscribe(channel, (message) => {
          dispatch(messageReceived({ channel, message }));
        });
      });
    });
    
    webSocketService.onDisconnect((event) => {
      dispatch(connectionLost(event.reason || 'Connection closed'));
    });
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export const disconnectWebSocket = () => (dispatch) => {
  try {
    webSocketService.disconnect();
    dispatch(connectionLost('User disconnected'));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export const subscribeToChannel = (channel) => (dispatch, getState) => {
  try {
    const { subscriptions } = getState().websocket;
    
    if (!subscriptions[channel]) {
      // Subscribe to the channel
      const unsubscribe = webSocketService.subscribe(channel, (message) => {
        dispatch(messageReceived({ channel, message }));
      });
      
      // Store the subscription
      dispatch(subscriptionAdded({ channel }));
      
      // Return the unsubscribe function
      return () => {
        unsubscribe();
        dispatch(unsubscribeFromChannel(channel));
      };
    }
    
    // Return a no-op function if already subscribed
    return () => {};
  } catch (error) {
    dispatch(setError(error.message));
    return () => {};
  }
};

export const unsubscribeFromChannel = (channel) => (dispatch) => {
  try {
    webSocketService.unsubscribe(channel);
    dispatch(subscriptionRemoved({ channel }));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export const sendWebSocketMessage = (channel, message) => (dispatch) => {
  try {
    const result = webSocketService.send({
      ...message,
      channel,
      timestamp: new Date().toISOString(),
    });
    
    if (!result) {
      throw new Error('Failed to send message');
    }
    
    return result;
  } catch (error) {
    dispatch(setError(error.message));
    throw error;
  }
};

// Selectors
export const selectIsConnected = (state) => state.websocket.isConnected;
export const selectError = (state) => state.websocket.error;
export const selectSubscriptions = (state) => state.websocket.subscriptions;
export const selectMessages = (channel) => (state) => 
  state.websocket.messages[channel] || [];
export const selectLastMessage = (channel) => (state) => {
  const messages = state.websocket.messages[channel] || [];
  return messages.length > 0 ? messages[messages.length - 1] : null;
};

export default websocketSlice.reducer;
