/**
 * API Key authentication middleware.
 * Checks for x-api-key header or ?api_key query parameter.
 */
export function authenticateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;

  if (!process.env.API_KEY) {
    // If no API_KEY is configured, skip authentication (development mode)
    return next();
  }

  if (!apiKey) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Provide an API key via x-api-key header or api_key query parameter',
    });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid API key',
    });
  }

  next();
}

/**
 * Validate POST /api/noise request body.
 */
export function validateNoiseReading(req, res, next) {
  const { device_id, noise_level, decibel_value } = req.body;
  const errors = [];

  if (!device_id || typeof device_id !== 'string' || device_id.trim().length === 0) {
    errors.push('device_id is required and must be a non-empty string');
  } else if (device_id.length > 64) {
    errors.push('device_id must be 64 characters or fewer');
  }

  if (noise_level === undefined || noise_level === null) {
    errors.push('noise_level is required');
  } else {
    const level = Number(noise_level);
    if (!Number.isInteger(level) || level < 1 || level > 5) {
      errors.push('noise_level must be an integer between 1 and 5');
    }
  }

  if (decibel_value === undefined || decibel_value === null) {
    errors.push('decibel_value is required');
  } else {
    const db = Number(decibel_value);
    if (isNaN(db) || db < 0 || db > 200) {
      errors.push('decibel_value must be a number between 0 and 200');
    }
  }

  // Optional: recorded_at timestamp validation
  if (req.body.recorded_at) {
    const ts = new Date(req.body.recorded_at);
    if (isNaN(ts.getTime())) {
      errors.push('recorded_at must be a valid ISO 8601 timestamp');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', messages: errors });
  }

  // Normalize values on req.body
  req.body.device_id = device_id.trim();
  req.body.noise_level = Number(noise_level);
  req.body.decibel_value = Number(decibel_value);

  next();
}
