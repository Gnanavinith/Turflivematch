import mongoose from 'mongoose';
import { config } from './env';

export async function connectDB() {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });
}

export async function disconnectDB() {
  await mongoose.disconnect();
  console.log('MongoDB disconnected gracefully');
}
