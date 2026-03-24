import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { CLIENT_URL } from './config/env.js';
import v1Router from './routes/v1.js';
import { globalErrorHandler } from './middleware/globalErrorHandler.js';

const app = express();

// Apply middleware IN THIS ORDER:
app.use(cors({ origin: CLIENT_URL, credentials: true }));
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