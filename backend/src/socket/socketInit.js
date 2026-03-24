import { Server } from 'socket.io';
import { CLIENT_URL } from '../config/env.js';
import { verifyToken } from '../utils/tokenHelpers.js';

let ioInstance = null;

export const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: { origin: CLIENT_URL, credentials: true }
  });

  ioInstance.use((socket, next) => {
    const { token } = socket.handshake.auth;
    if (!token) return next(new Error('Unauthorized'));

    try {
      const decoded = verifyToken(token);
      socket.userId = decoded.userId || decoded._id || decoded.id;
      socket.role    = decoded.role;
      socket.schoolId = decoded.schoolId || null;

      if (!socket.userId) {
        return next(new Error('Unauthorized'));
      }

      next();
    } catch (err) {
      next(new Error('Unauthorized'));
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log('[Socket] connected — userId:', socket.userId);
    socket.join(`user:${socket.userId}`);

    socket.on('disconnect', (reason) => {
      console.log('[Socket] disconnected — userId:', socket.userId, '— reason:', reason);
    });
  });

  return ioInstance;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io is not initialized');
  }

  return ioInstance;
};
