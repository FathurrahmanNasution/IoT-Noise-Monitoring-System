import { Volume2, BarChart3, Zap, Smartphone } from 'lucide-react';
import Header from './Header';
import StatsCard from './StatsCard';
import CurrentLevel from './CurrentLevel';
import NoiseChart from './NoiseChart';
import DeviceList from './DeviceList';

export default function Dashboard({ data }) {
  const { latestReadings, history, stats, isConnected, isLoading, error, lastUpdated } = data;

  if (isLoading) {
    return (
      <div className="app-layout">
        <Header isConnected={false} lastUpdated={null} />
        <div style={loadingStyles.container}>
          <div style={loadingStyles.spinner} />
          <p style={loadingStyles.text}>Connecting to backend...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Header isConnected={isConnected} lastUpdated={lastUpdated} />

      {error && (
        <div style={errorStyles.banner}>
          <span>⚠️ {error}</span>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Stats Row */}
        <div className="stats-row">
          <StatsCard
            icon={Volume2}
            label="Average Decibel"
            value={stats?.avg_decibel ?? '—'}
            unit="dB"
            color="#6366f1"
            delay={1}
          />
          <StatsCard
            icon={Zap}
            label="Peak Level"
            value={stats?.max_level ?? '—'}
            unit="/5"
            trend={stats?.max_level >= 4 ? 'up' : undefined}
            color="#fb7185"
            delay={2}
          />
          <StatsCard
            icon={BarChart3}
            label="Total Readings"
            value={stats?.total_readings ?? '—'}
            unit="1h"
            color="#22d3ee"
            delay={3}
          />
          <StatsCard
            icon={Smartphone}
            label="Active Devices"
            value={stats?.active_devices ?? '—'}
            color="#34d399"
            delay={4}
          />
        </div>

        {/* Main Row: Gauge + Chart */}
        <div className="main-row">
          <CurrentLevel latestReadings={latestReadings} />
          <NoiseChart history={history} />
        </div>

        {/* Bottom Row: Devices */}
        <div className="bottom-row">
          <DeviceList latestReadings={latestReadings} />
        </div>
      </div>
    </div>
  );
}

const loadingStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    gap: '1.5rem',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '3px solid rgba(99, 102, 241, 0.2)',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'spin-slow 1s linear infinite',
  },
  text: {
    color: '#94a3b8',
    fontSize: '0.9rem',
  },
};

const errorStyles = {
  banner: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '0.75rem',
    padding: '0.75rem 1rem',
    color: '#fca5a5',
    fontSize: '0.85rem',
    marginBottom: '1rem',
  },
};
