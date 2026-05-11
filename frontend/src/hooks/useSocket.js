// hooks/useSocket.js
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Use the correct port where your Socket.IO server is running
const SOCKET_URL = 'http://localhost:5000'; // Change to your Socket.IO server port

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only connect if not already connected
    if (socket) return;

    const newSocket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'], // Try polling first, then upgrade to websocket
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket.IO connected to', SOCKET_URL);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket.IO disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.log('Socket.IO connection error:', error.message);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  return { socket, isConnected };
};