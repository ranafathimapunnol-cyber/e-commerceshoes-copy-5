import { io } from 'socket.io-client';

class AdminSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(adminId, adminName, token) {
    this.socket = io('http://localhost:3002', {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.socket.emit('authenticate', {
        userId: adminId,
        userName: adminName,
        userType: 'admin'
      });
    });

    return this.socket;
  }

  sendUserUpdate(userId, title, message, data = {}) {
    if (this.socket && this.isConnected) {
      this.socket.emit('admin:updateUser', {
        userId,
        update: { title, message, data }
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default new AdminSocketService();