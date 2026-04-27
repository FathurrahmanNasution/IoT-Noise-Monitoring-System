import { Activity, Wifi, WifiOff } from 'lucide-react';

export default function Header({ isConnected, lastUpdated }) {
  return (
    <header className="app-header" style={styles.header}>
      <div style={styles.left}>
        <div style={styles.logoContainer}>
          <div style={styles.soundWave}>
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                style={{
                  ...styles.waveBar,
                  animationDelay: `${i * 0.15}s`,
                  height: `${10 + i * 6}px`,
                }}
              />
            ))}
          </div>
          <h1 style={styles.title}>
            Noise<span style={styles.titleAccent}>Monitor</span>
          </h1>
        </div>
        <span style={styles.badge}>IoT Dashboard</span>
      </div>

      <div style={styles.right}>
        {lastUpdated && (
          <span style={styles.lastUpdated}>
            Last update: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
        <div
          style={{
            ...styles.statusPill,
            background: isConnected
              ? 'rgba(52, 211, 153, 0.15)'
              : 'rgba(239, 68, 68, 0.15)',
            borderColor: isConnected
              ? 'rgba(52, 211, 153, 0.3)'
              : 'rgba(239, 68, 68, 0.3)',
          }}
        >
          <span
            style={{
              ...styles.statusDot,
              background: isConnected ? '#34d399' : '#ef4444',
              boxShadow: isConnected
                ? '0 0 8px rgba(52, 211, 153, 0.6)'
                : '0 0 8px rgba(239, 68, 68, 0.6)',
            }}
          />
          {isConnected ? (
            <Wifi size={14} color="#34d399" />
          ) : (
            <WifiOff size={14} color="#ef4444" />
          )}
          <span
            style={{
              color: isConnected ? '#34d399' : '#ef4444',
              fontSize: '0.8rem',
              fontWeight: 500,
            }}
          >
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 0',
    marginBottom: '0.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  soundWave: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '3px',
    height: '28px',
  },
  waveBar: {
    display: 'inline-block',
    width: '3px',
    background: 'linear-gradient(to top, #6366f1, #22d3ee)',
    borderRadius: '2px',
    animation: 'wave-animation 1.2s ease-in-out infinite',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#f1f5f9',
    letterSpacing: '-0.02em',
  },
  titleAccent: {
    color: '#6366f1',
  },
  badge: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#94a3b8',
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '9999px',
    padding: '0.2rem 0.65rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  lastUpdated: {
    fontSize: '0.8rem',
    color: '#64748b',
  },
  statusPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.35rem 0.75rem',
    borderRadius: '9999px',
    border: '1px solid',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    animation: 'pulse-glow 2s ease infinite',
  },
};
