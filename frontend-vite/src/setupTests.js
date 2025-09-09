import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Mock window.matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {},
  };
};

// Configure test-id attribute
configure({ testIdAttribute: 'data-testid' });

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock WebSocket
class WebSocketMock {
  constructor(url) {
    this.url = url;
    this.onopen = jest.fn();
    this.onclose = jest.fn();
    this.onmessage = jest.fn();
    this.onerror = jest.fn();
    this.close = jest.fn().mockImplementation(() => {
      this.onclose();
    });
    this.send = jest.fn();
  }
}

global.WebSocket = WebSocketMock;

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue('mockMediaStream'),
  },
  writable: true,
});

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;
