import mongoose from 'mongoose';
import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './socket/socketInit.js';
import { PORT } from './config/env.js';

const server = http.createServer(app);
initSocket(server);

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`[Server] running on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error('[Server] failed to start:', err.message);
  process.exit(1);
});

// Graceful SIGTERM shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received — shutting down gracefully');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('[Server] DB connection closed');
      process.exit(0);
    });
  });
});