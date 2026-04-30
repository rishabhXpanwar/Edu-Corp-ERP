import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { CLIENT_URL } from './config/env.js';
import v1Router from './routes/v1.js';
import { globalErrorHandler } from './middleware/globalErrorHandler.js';

const app = express();

// Apply middleware IN THIS ORDER:
const allowedOrigins = CLIENT_URL.split(',').map(url => url.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman or server-to-server)
    if (!origin) return callback(null, true);
    
    // Allow origin if it's in the allowed list or is a Vercel preview deployment
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount root router
app.use('/api/v1', v1Router);

// 404 handler (must come AFTER router mount, BEFORE error handler)
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler — MUST be last
app.use(globalErrorHandler);

export default app;