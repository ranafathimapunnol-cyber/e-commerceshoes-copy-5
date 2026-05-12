// src/hooks/useSocket.js
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only connect if admin is logged in
    const adminToken = localStorage.getItem('admin_access');
    if (!adminToken) {
      console.log('No admin token, skipping socket connection');
      return;
    }

    console.log('Connecting to socket server...');

    // Try with polling only first (more reliable)
    const socketInstance = io('http://localhost:3002', {
      transports: ['polling'], // Use polling first, which is more reliable
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: true
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected successfully!');
      setIsConnected(true);
      setError(null);

      // Authenticate as admin
      socketInstance.emit('authenticate', {
        userId: 'admin_' + Date.now(),
        userType: 'admin',
        userName: 'Administrator'
      });
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setError(err.message);
      setIsConnected(false);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  return { socket, isConnected, error };
};