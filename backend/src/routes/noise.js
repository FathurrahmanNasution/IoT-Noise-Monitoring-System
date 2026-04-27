import { Router } from 'express';
import pool from '../db.js';
import { validateNoiseReading } from '../middleware/validate.js';

const router = Router();

/**
 * POST /api/noise
 * Ingest a noise reading from a sensor device.
 */
router.post('/', validateNoiseReading, async (req, res) => {
  try {
    const { device_id, noise_level, decibel_value, recorded_at } = req.body;

    const result = await pool.query(
      `INSERT INTO noise_readings (device_id, noise_level, decibel_value, recorded_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id, device_id, noise_level, decibel_value, recorded_at, created_at`,
      [device_id, noise_level, decibel_value, recorded_at || new Date().toISOString()]
    );

    res.status(201).json({
      message: 'Noise reading recorded',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Error inserting noise reading:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/noise/latest
 * Get the latest reading from each device.
 */
router.get('/latest', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (device_id)
        id, device_id, noise_level, decibel_value, recorded_at
      FROM noise_readings
      ORDER BY device_id, recorded_at DESC
    `);

    res.json({ data: result.rows });
  } catch (err) {
    console.error('Error fetching latest readings:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/noise/history
 * Get recent noise readings with optional filtering.
 * Query params: limit (default 100), device_id, from, to
 */
router.get('/history', async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 100, 1), 1000);
    const deviceId = req.query.device_id;
    const from = req.query.from;
    const to = req.query.to;

    let query = 'SELECT id, device_id, noise_level, decibel_value, recorded_at FROM noise_readings';
    const conditions = [];
    const params = [];

    if (deviceId) {
      params.push(deviceId);
      conditions.push(`device_id = $${params.length}`);
    }

    if (from) {
      params.push(from);
      conditions.push(`recorded_at >= $${params.length}`);
    }

    if (to) {
      params.push(to);
      conditions.push(`recorded_at <= $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY recorded_at DESC';
    params.push(limit);
    query += ` LIMIT $${params.length}`;

    const result = await pool.query(query, params);

    res.json({ data: result.rows });
  } catch (err) {
    console.error('Error fetching history:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/noise/stats
 * Get aggregate statistics over a time window.
 * Query params: minutes (default 60)
 */
router.get('/stats', async (req, res) => {
  try {
    const minutes = Math.min(Math.max(parseInt(req.query.minutes) || 60, 1), 1440);

    const result = await pool.query(
      `SELECT
        COUNT(*)::int AS total_readings,
        COUNT(DISTINCT device_id)::int AS active_devices,
        ROUND(AVG(decibel_value)::numeric, 1) AS avg_decibel,
        ROUND(MIN(decibel_value)::numeric, 1) AS min_decibel,
        ROUND(MAX(decibel_value)::numeric, 1) AS max_decibel,
        ROUND(AVG(noise_level)::numeric, 1) AS avg_level,
        MIN(noise_level) AS min_level,
        MAX(noise_level) AS max_level
      FROM noise_readings
      WHERE recorded_at >= NOW() - INTERVAL '1 minute' * $1`,
      [minutes]
    );

    res.json({
      data: result.rows[0],
      window_minutes: minutes,
    });
  } catch (err) {
    console.error('Error fetching stats:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
