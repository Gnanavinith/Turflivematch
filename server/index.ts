import express from 'express';
import cors from 'cors';
import dns from 'dns';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/env';
import { connectDB } from './config/db';
import playerRoutes from './routes/playerRoutes';
import teamRoutes from './routes/teamRoutes';
import matchRoutes from './routes/matchRoutes';
import { matchController } from './controllers/matchController';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Some networks give Node a loopback DNS relay that refuses queries.
// Fall back to Google Public DNS so SRV lookups (MongoDB Atlas) work.
const configuredServers = dns.getServers();
if (configuredServers.every((server) => server === '127.0.0.1' || server === '::1')) {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}

const app = express();

// Track the public host from incoming requests so the keep-alive cron can ping
// the server's own public URL (Render free tier sleeps after 15 min idle).
let publicHost = `localhost:${config.port}`;
app.use((req, _res, next) => {
  const host = req.get('host');
  if (host) publicHost = host;
  next();
});

// Middleware
app.use(cors({
  origin: ['https://turflivescore.netlify.app', 'http://localhost:3000', 'http://localhost:4000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Never cache API responses — this app is a live scoreboard and every device
// must see fresh data immediately. Without this, browsers/CDNs apply heuristic
// caching to GET responses and scoreboards go stale for minutes on end.
app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, max-age=0, must-revalidate');
  res.set('Pragma', 'no-cache');
  next();
});

// API Routes
app.use('/api/players', playerRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);

app.get('/api/ping', (_req, res) => res.json({ ok: true }));

// Reset & Sync Routes
app.post('/api/reset', matchController.reset);
app.post('/api/sync', matchController.sync);

// Serve static frontend in production (only if dist exists)
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`🏏 Turf API Server running on http://localhost:${config.port}`);
    console.log(`📍 Environment: ${config.nodeEnv}`);
    console.log(`🗄️ MongoDB: Connected`);
  });

  // ── Keep-alive cron ──────────────────────────────────────────────────
  // Render free tier sleeps the instance after ~15 minutes with no traffic,
  // which makes every device's poll wait through a 20-30s cold start (and
  // looks like data is minutes late). Ping our own public URL every 10 min
  // so inbound traffic keeps the instance awake. Self-pings pass through
  // Render's ingress proxy, so they reset the idle timer.
  const KEEP_ALIVE_MS = 10 * 60 * 1000;
  setInterval(() => {
    const host = publicHost.replace(/^https?:\/\//, '');
    const isLocal = host.includes('localhost') || host.startsWith('127.0.0.1') || host.startsWith('0.0.0.0') || host.startsWith('::1');
    if (isLocal) return;
    const url = `https://${host}/api/ping`;
    fetch(url, { signal: AbortSignal.timeout(20000) })
      .then(res => { if (!res.ok) console.warn(`Keep-alive ping failed (${res.status})`); })
      .catch(err => console.warn('Keep-alive ping error:', err));
  }, KEEP_ALIVE_MS);

}).catch((err) => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});
