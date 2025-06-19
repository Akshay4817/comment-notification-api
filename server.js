const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { setSocketIO } = require('./controllers/commentController');



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // Use specific origin in production
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});
setSocketIO(io);

// Track connected users { userId: socketId }
const onlineUsers = new Map();

// Handle Socket.IO connections
io.on('connection', (socket) => {
  console.log('✅ Socket connected:', socket.id);

  // Register user with socket
  socket.on('register', (userId) => {
    console.log(`📌 User registered: ${userId}`);
    onlineUsers.set(userId, socket.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected:', socket.id);
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});

// Make io and onlineUsers available in controllers
app.set('io', io);
app.set('onlineUsers', onlineUsers);

// ✅ Middlewares
app.use(express.json());
app.use(cors());

// ✅ Routes
const authRoutes = require('./routes/authRoutes');
const commentRoutes = require('./routes/comment');
const notificationRoutes = require('./routes/notification');

app.use('/auth', authRoutes);
app.use('/comments', commentRoutes);
app.use('/notifications', notificationRoutes);

// ✅ Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ✅ Connect MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
