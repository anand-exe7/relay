// Placeholder Socket.io client - ready to be connected to a real socket server

type EventCallback = (data: unknown) => void;

interface SocketEvents {
  [key: string]: EventCallback[];
}

class SocketPlaceholder {
  private events: SocketEvents = {};
  private connected = false;

  connect() {
    console.log('[Socket] Connecting...');
    this.connected = true;
    console.log('[Socket] Connected (placeholder)');
  }

  disconnect() {
    console.log('[Socket] Disconnecting...');
    this.connected = false;
  }

  emit(event: string, data?: unknown) {
    console.log(`[Socket] Emit "${event}":`, data);
    // Placeholder: would send to server
  }

  on(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    console.log(`[Socket] Registered listener for "${event}"`);
  }

  off(event: string, callback?: EventCallback) {
    if (!this.events[event]) return;
    
    if (callback) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    } else {
      delete this.events[event];
    }
    console.log(`[Socket] Removed listener for "${event}"`);
  }

  // For testing: simulate receiving an event
  _simulateEvent(event: string, data: unknown) {
    if (this.events[event]) {
      this.events[event].forEach(cb => cb(data));
    }
  }

  isConnected() {
    return this.connected;
  }
}

export const socket = new SocketPlaceholder();

// Socket event names for consistency
export const SOCKET_EVENTS = {
  // Task events
  TASK_CREATE: 'task:create',
  TASK_CREATED: 'task:created',
  TASK_UPDATE: 'task:update',
  TASK_UPDATED: 'task:updated',
  
  // Chat events
  CHAT_MESSAGE: 'chat:message',
  CHAT_RECEIVED: 'chat:received',
  
  // Notification events
  NOTIFICATION_NEW: 'notification:new',
  
  // Member events
  MEMBER_JOINED: 'member:joined',
  MEMBER_LEFT: 'member:left',
} as const;