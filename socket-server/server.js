require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// Store connected users and admins
const connectedUsers = new Map();
const connectedAdmins = new Set();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    users: connectedUsers.size,
    admins: connectedAdmins.size,
    timestamp: new Date()
  });
});

// API endpoint for Django to send notifications to admin
app.post('/api/notify-admin', (req, res) => {
  const { userId, userName, notificationType, title, message, data } = req.body;

  console.log(`📢 API Notification from ${userName}: ${title}`);

  io.to('admin_room').emit('admin:newNotification', {
    userId,
    userName,
    notificationType,
    title,
    message,
    data: data || {},
    timestamp: new Date()
  });

  res.json({ status: 'sent' });
});

// API endpoint for admin to send updates to user
app.post('/api/notify-user', (req, res) => {
  const { userId, title, message, data } = req.body;

  console.log(`📨 API Update to user ${userId}: ${title}`);

  io.to(`user_${userId}`).emit('user:update', {
    title,
    message,
    data: data || {},
    timestamp: new Date(),
    fromAdmin: true
  });

  res.json({ status: 'sent' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🟢 New connection: ${socket.id}`);

  socket.on('authenticate', (data) => {
    const { userId, userType, userName } = data;

    socket.userId = userId;
    socket.userType = userType;
    socket.userName = userName;

    if (userType === 'admin') {
      connectedAdmins.add(socket.id);
      console.log(`👑 Admin connected: ${userName}`);
      socket.emit('admin:connected', {
        message: 'Admin dashboard connected',
        activeUsers: connectedUsers.size
      });
      socket.join('admin_room');
      console.log(`Admin joined admin_room. Total admins: ${connectedAdmins.size}`);
    } else {
      connectedUsers.set(userId, socket.id);
      console.log(`👤 User connected: ${userName} (ID: ${userId})`);
      socket.emit('user:connected', {
        message: 'Connected to notification service'
      });
      socket.join(`user_${userId}`);
      console.log(`User joined user_${userId}`);

      // Notify all admins that user is online
      io.to('admin_room').emit('admin:userOnline', {
        userId,
        userName,
        timestamp: new Date()
      });
    }
  });

  // User sends notification to admin
  socket.on('user:sendNotification', (data) => {
    console.log(`📢 User notification from ${socket.userName}: ${data.title}`);
    console.log('Broadcasting to admin_room...');

    // Broadcast to all connected admins
    io.to('admin_room').emit('admin:newNotification', {
      ...data,
      userId: socket.userId,
      userName: socket.userName,
      timestamp: new Date()
    });

    console.log('Notification sent to admin_room');
  });

  // Admin sends update to specific user
  socket.on('admin:updateUser', (data) => {
    const { userId, update } = data;
    console.log(`📨 Admin update to user ${userId}: ${update.title}`);

    io.to(`user_${userId}`).emit('user:update', {
      ...update,
      timestamp: new Date(),
      fromAdmin: true
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`🔴 Disconnected: ${socket.id}`);

    if (socket.userType === 'admin') {
      connectedAdmins.delete(socket.id);
      console.log(`Admin disconnected. Remaining admins: ${connectedAdmins.size}`);
    } else if (socket.userId) {
      connectedUsers.delete(socket.userId);
      io.to('admin_room').emit('admin:userOffline', {
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date()
      });
    }
  });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on http://localhost:3002`);
  console.log(`📊 Health check: http://localhost:3002/health`);
});