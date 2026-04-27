import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import noiseRoutes from './routes/noise.js';
import { authenticateApiKey } from './middleware/validate.js';
import { initializeSchema } from './utils/schema.js';

const app = express();
const PORT = parseInt(process.env.PORT) || 3001;

// --- Middleware ---
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// --- Health check (no auth required) ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Protected routes ---
app.use('/api/noise', authenticateApiKey, noiseRoutes);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// --- Error handler ---
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// --- Start server ---
async function start() {
  try {
    // Initialize database schema on startup
    await initializeSchema();

    app.listen(PORT, () => {
      console.log(`🚀 Noise IoT Backend running on http://localhost:${PORT}`);
      console.log(`📡 API endpoints:`);
      console.log(`   POST   /api/noise`);
      console.log(`   GET    /api/noise/latest`);
      console.log(`   GET    /api/noise/history`);
      console.log(`   GET    /api/noise/stats`);
      console.log(`   GET    /api/health`);
      console.log(`🔐 API key auth: ${process.env.API_KEY ? 'ENABLED' : 'DISABLED (set API_KEY in .env)'}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
