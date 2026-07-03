import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env';
import { connectDB } from './config/db';
import playerRoutes from './routes/playerRoutes';
import teamRoutes from './routes/teamRoutes';
import matchRoutes from './routes/matchRoutes';
import { matchController } from './controllers/matchController';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: ['https://turflivescore.netlify.app', 'http://localhost:3000', 'http://localhost:4000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// API Routes
app.use('/api/players', playerRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);

// Reset & Sync Routes
app.post('/api/reset', matchController.reset);
app.post('/api/sync', matchController.sync);

// Serve static frontend in production
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`🏏 Turf API Server running on http://localhost:${config.port}`);
    console.log(`📍 Environment: ${config.nodeEnv}`);
    console.log(`🗄️ MongoDB: Connected`);
  });
}).catch((err) => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});
