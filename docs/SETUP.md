# Noise Detection IoT — Setup Guide

## Prerequisites

- **Node.js** v18+ and npm
- **Android Studio** (for building the Android app)
- **Neon account** (free tier: [neon.tech](https://neon.tech))
- **Cloudflare account** (optional, for public API exposure)

---

## 1. Database Setup (Neon PostgreSQL)

1. Create an account at [neon.tech](https://neon.tech)
2. Create a new project (e.g., `noise-iot`)
3. Copy the connection string from the dashboard
4. The schema is auto-created on first backend startup

---

## 2. Backend Setup

```bash
cd backend

# Copy and configure environment
cp .env.example .env
# Edit .env with your Neon connection string and API key:
#   DATABASE_URL=postgres://user:pass@host.neon.tech/dbname?sslmode=require
#   PORT=3001
#   API_KEY=your-secret-key-here

# Install dependencies
npm install

# Start development server
npm run dev
```

The backend will:
- Auto-initialize the database schema on startup
- Listen on `http://localhost:3001`
- Print available API endpoints

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/noise` | Submit a noise reading |
| GET | `/api/noise/latest` | Get latest reading per device |
| GET | `/api/noise/history` | Get recent readings (supports `?limit=`, `?device_id=`, `?from=`, `?to=`) |
| GET | `/api/noise/stats` | Get aggregate stats (supports `?minutes=`) |
| GET | `/api/health` | Health check (no auth) |

All endpoints (except `/api/health`) require `x-api-key` header or `?api_key=` query param.

### Test with curl

```bash
# Health check
curl http://localhost:3001/api/health

# Submit a reading
curl -X POST http://localhost:3001/api/noise \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-key-here" \
  -d '{"device_id":"test-device-1","noise_level":3,"decibel_value":62.5}'

# Get latest
curl http://localhost:3001/api/noise/latest?api_key=your-secret-key-here

# Get history
curl http://localhost:3001/api/noise/history?api_key=your-secret-key-here&limit=10
```

---

## 3. Frontend Setup

```bash
cd frontend

# Copy and configure environment
cp .env.example .env
# Edit .env:
#   VITE_API_URL=http://localhost:3001
#   VITE_API_KEY=your-secret-key-here

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Deploy to Vercel

1. Push the `frontend/` directory to a Git repo
2. Import in Vercel → set root directory to `frontend`
3. Add environment variables:
   - `VITE_API_URL` = your public backend URL (Cloudflare Tunnel URL)
   - `VITE_API_KEY` = your API key
4. Deploy

---

## 4. Android App Setup

1. Open `android/NoiseDetector/` in Android Studio
2. Sync Gradle and let dependencies download
3. In `MainScreen`, configure:
   - **Server URL**: Your backend URL (e.g., `http://10.0.2.2:3001` for emulator, or public URL)
   - **API Key**: Your API key
4. Build and run on device/emulator
5. Grant microphone permission when prompted
6. Tap "Start Monitoring"

> **Note**: `10.0.2.2` is the emulator's alias for `localhost` on your PC. For a physical device, use your PC's local IP or the Cloudflare Tunnel URL.

---

## 5. Public API Exposure (Cloudflare Tunnel)

For accessing the backend from the internet (Android on mobile data, Vercel frontend):

### Quick method (temporary URL, no domain needed)

```bash
# Install cloudflared
# Windows: winget install cloudflare.cloudflared
# Mac: brew install cloudflare/cloudflare/cloudflared

# Start tunnel (gives you a temporary *.trycloudflare.com URL)
cloudflared tunnel --url http://localhost:3001
```

### Production method (persistent custom domain)

```bash
cloudflared tunnel login
cloudflared tunnel create noise-iot
# Configure DNS in Cloudflare dashboard
cloudflared tunnel run noise-iot
```

Update your frontend `.env` and Android app to use the tunnel URL.

---

## 6. End-to-End Testing Checklist

- [ ] Backend starts without errors
- [ ] `curl /api/health` returns `{ "status": "ok" }`
- [ ] POST a test reading → returns `201`
- [ ] GET `/api/noise/latest` returns the test reading
- [ ] Frontend dashboard loads and shows the reading
- [ ] Android app connects and sends readings
- [ ] Dashboard updates in real-time (3s polling)
- [ ] Cloudflare Tunnel URL works from external network
