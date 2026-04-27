import pool from '../db.js';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS noise_readings (
    id              SERIAL PRIMARY KEY,
    device_id       VARCHAR(64) NOT NULL,
    noise_level     SMALLINT NOT NULL CHECK (noise_level BETWEEN 1 AND 5),
    decibel_value   REAL NOT NULL,
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_noise_readings_recorded_at 
    ON noise_readings (recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_noise_readings_device_id 
    ON noise_readings (device_id, recorded_at DESC);
`;

export async function initializeSchema() {
  const client = await pool.connect();
  try {
    await client.query(SCHEMA_SQL);
    console.log('✅ Database schema initialized successfully');
  } catch (err) {
    console.error('❌ Failed to initialize schema:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

// Run directly if called as a script
const isMainModule = process.argv[1]?.endsWith('schema.js');
if (isMainModule) {
  initializeSchema()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
