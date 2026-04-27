const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_KEY = import.meta.env.VITE_API_KEY || '';

async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'x-api-key': API_KEY }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || errorBody.error || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to the backend server');
    }
    throw err;
  }
}

export async function fetchLatest() {
  return apiFetch('/api/noise/latest');
}

export async function fetchHistory(params = {}) {
  const query = new URLSearchParams();
  if (params.limit) query.set('limit', params.limit);
  if (params.device_id) query.set('device_id', params.device_id);
  if (params.from) query.set('from', params.from);
  if (params.to) query.set('to', params.to);

  const qs = query.toString();
  return apiFetch(`/api/noise/history${qs ? '?' + qs : ''}`);
}

export async function fetchStats(minutes = 60) {
  return apiFetch(`/api/noise/stats?minutes=${minutes}`);
}

export async function checkHealth() {
  return apiFetch('/api/health');
}
