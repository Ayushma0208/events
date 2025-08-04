import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import connectDB from './src/config/db';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Setup WebSocket
export const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// Track connected clients
io.on('connection', socket => {
  console.log(`📡 WebSocket client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`❌ WebSocket client disconnected: ${socket.id}`);
  });
});

// Start everything
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
