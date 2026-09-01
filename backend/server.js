const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const allowedOrigins = [
  'https://kernelsocial.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
  allowedOrigins.push(process.env.CLIENT_URL.replace(/\/$/, ''));
}

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  }
});

// Socket.io Logic
const Message = require('./models/Message');
const users = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register', (userId) => {
    users.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on('send_message', async (data) => {
    const { sender, receiver, text } = data;
    try {
      const newMessage = new Message({ sender, receiver, text });
      await newMessage.save();

      const receiverSocketId = users.get(receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', newMessage);
      }
      // Also emit back to sender for confirmation
      socket.emit('message_sent', newMessage);
    } catch (error) {
      console.error('Socket error:', error);
    }
  });

  socket.on('disconnect', () => {
    for (let [userId, socketId] of users.entries()) {
      if (socketId === socket.id) {
        users.delete(userId);
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const blogRoutes = require('./routes/blogRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Use Routes (Mounted at both root and /api prefixes)
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);

app.use('/users', userRoutes);
app.use('/api/users', userRoutes);

app.use('/projects', projectRoutes);
app.use('/api/projects', projectRoutes);

app.use('/blogs', blogRoutes);
app.use('/api/blogs', blogRoutes);

app.use('/notifications', notificationRoutes);
app.use('/api/notifications', notificationRoutes);

app.use('/messages', messageRoutes);
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 5000;

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kernel';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Database connection error:', err));

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
