import WebSocketService from '../websocketService';

describe('WebSocketService', () => {
  let webSocketService;
  const mockUrl = 'ws://localhost:1234';
  const mockToken = 'test-token';
  const mockMessage = { type: 'test', payload: 'test payload' };
  const mockCallback = jest.fn();

  beforeEach(() => {
    // Reset the singleton instance
    WebSocketService.instance = null;
    webSocketService = new WebSocketService();
    
    // Mock WebSocket
    global.WebSocket = jest.fn().mockImplementation(() => ({
      addEventListener: jest.fn((event, cb) => {
        if (event === 'open') {
          cb();
        }
      }),
      removeEventListener: jest.fn(),
      send: jest.fn(),
      close: jest.fn(),
      readyState: 1, // OPEN
    }));

    // Clear all mocks
    jest.clearAllMocks();
  });

  it('should create a singleton instance', () => {
    const instance1 = new WebSocketService();
    const instance2 = new WebSocketService();
    expect(instance1).toBe(instance2);
  });

  it('should connect to WebSocket with token', () => {
    webSocketService.connect(mockUrl, mockToken);
    expect(global.WebSocket).toHaveBeenCalledWith(
      `${mockUrl}?token=${mockToken}`
    );
  });

  it('should subscribe to a channel', () => {
    webSocketService.connect(mockUrl, mockToken);
    webSocketService.subscribe('test-channel', mockCallback);
    
    expect(webSocketService.channels['test-channel']).toBeDefined();
    expect(webSocketService.channels['test-channel'].has(mockCallback)).toBe(true);
  });

  it('should unsubscribe from a channel', () => {
    webSocketService.connect(mockUrl, mockToken);
    webSocketService.subscribe('test-channel', mockCallback);
    webSocketService.unsubscribe('test-channel', mockCallback);
    
    expect(webSocketService.channels['test-channel'].has(mockCallback)).toBe(false);
  });

  it('should handle incoming messages', () => {
    const testMessage = { 
      channel: 'test-channel',
      data: { test: 'data' } 
    };
    
    webSocketService.connect(mockUrl, mockToken);
    webSocketService.subscribe('test-channel', mockCallback);
    
    // Simulate message event
    const messageEvent = { data: JSON.stringify(testMessage) };
    webSocketService.socket.onmessage(messageEvent);
    
    expect(mockCallback).toHaveBeenCalledWith(testMessage.data);
  });

  it('should handle connection errors', () => {
    const errorCallback = jest.fn();
    webSocketService.onError(errorCallback);
    
    webSocketService.connect(mockUrl, mockToken);
    
    // Simulate error event
    const errorEvent = { type: 'error' };
    webSocketService.socket.onerror(errorEvent);
    
    expect(errorCallback).toHaveBeenCalledWith(errorEvent);
  });

  it('should handle reconnection', () => {
    jest.useFakeTimers();
    
    webSocketService.connect(mockUrl, mockToken);
    
    // Simulate close event
    webSocketService.socket.onclose();
    
    // Fast-forward time to trigger reconnection
    jest.advanceTimersByTime(1000);
    
    expect(global.WebSocket).toHaveBeenCalledTimes(2); // Initial + reconnection
    
    jest.useRealTimers();
  });

  it('should close the connection', () => {
    webSocketService.connect(mockUrl, mockToken);
    webSocketService.disconnect();
    
    expect(webSocketService.socket.close).toHaveBeenCalled();
    expect(webSocketService.socket).toBeNull();
  });
});
