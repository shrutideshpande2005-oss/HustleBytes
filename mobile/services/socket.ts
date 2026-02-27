import { io, Socket } from 'socket.io-client';

const BACKEND_URL = 'http://172.20.10.7:5000'; // Real Backend IP for devices

class SocketService {
  private socket: Socket | null = null;
  private registeredListeners: Map<string, Function[]> = new Map();

  connect() {
    if (!this.socket) {
      this.socket = io(BACKEND_URL, {
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to WebSockets Backend:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Disconnected from WebSockets Backend');
      });

      // Re-apply any listeners that were registered before connection
      this.registeredListeners.forEach((callbacks, event) => {
        callbacks.forEach(cb => {
          this.socket?.on(event, cb as any);
        });
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    } else {
      console.log("Mock emit (socket null): ", event);
    }
  }

  on(event: string, callback: Function) {
    if (!this.registeredListeners.has(event)) {
      this.registeredListeners.set(event, []);
    }
    this.registeredListeners.get(event)?.push(callback);

    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  off(event: string, callback?: Function) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback as any);
        const listeners = this.registeredListeners.get(event) || [];
        this.registeredListeners.set(event, listeners.filter(cb => cb !== callback));
      } else {
        this.socket.off(event);
        this.registeredListeners.delete(event);
      }
    }
  }
}

const socketService = new SocketService();
export default socketService;

export const SOCKET_EVENTS = {
  LOCATION_UPDATE: "LOCATION_UPDATE",
  EMERGENCY_STATUS: "EMERGENCY_STATUS",
  NEW_EMERGENCY: "NEW_EMERGENCY",
  STATUS_UPDATE: "STATUS_UPDATE",
};