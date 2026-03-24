import mongoose from 'mongoose';
import { MONGO_URI } from './env.js';

export const connectDB = async () => {
  mongoose.set('strictQuery', true);
  
  let retries = 3;
  while (retries > 0) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('[DB] MongoDB connected successfully');
      return;
    } catch (err) {
      retries -= 1;
      if (retries === 0) {
        console.error('[DB] MongoDB connection failed after 3 attempts');
        throw err;
      }
      console.log(`[DB] Connection failed. Retrying in 5s... (${retries} attempts left)`);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};