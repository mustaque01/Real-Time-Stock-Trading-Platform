import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) return;

    this.socket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('stockPrice', (data) => {
      this.emit('stockPrice', data);
    });

    this.socket.on('orderUpdate', (data) => {
      this.emit('orderUpdate', data);
    });

    this.socket.on('tradeExecuted', (data) => {
      this.emit('tradeExecuted', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  subscribeToStock(symbol) {
    if (this.socket) {
      this.socket.emit('subscribeStock', symbol);
    }
  }

  unsubscribeFromStock(symbol) {
    if (this.socket) {
      this.socket.emit('unsubscribeStock', symbol);
    }
  }
}

export default new WebSocketService();
