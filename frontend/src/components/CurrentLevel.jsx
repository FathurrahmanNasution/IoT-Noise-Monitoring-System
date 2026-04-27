import { useEffect, useState } from 'react';

const LEVEL_CONFIG = {
  1: { label: 'Very Quiet', color: '#34d399', bgGlow: 'rgba(52, 211, 153, 0.12)' },
  2: { label: 'Quiet', color: '#6ee7b7', bgGlow: 'rgba(110, 231, 183, 0.12)' },
  3: { label: 'Moderate', color: '#fbbf24', bgGlow: 'rgba(251, 191, 36, 0.12)' },
  4: { label: 'Loud', color: '#f97316', bgGlow: 'rgba(249, 115, 22, 0.12)' },
  5: { label: 'Very Loud', color: '#ef4444', bgGlow: 'rgba(239, 68, 68, 0.12)' },
};

export default function CurrentLevel({ latestReadings }) {
  const [displayLevel, setDisplayLevel] = useState(0);
  const [displayDb, setDisplayDb] = useState(0);

  // Compute unified level from all devices
  const currentLevel = latestReadings.length > 0
    ? Math.round(latestReadings.reduce((sum, r) => sum + r.noise_level, 0) / latestReadings.length)
    : 0;

  const currentDb = latestReadings.length > 0
    ? (latestReadings.reduce((sum, r) => sum + r.decibel_value, 0) / latestReadings.length).toFixed(1)
    : 0;

  // Animate level transitions
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayLevel(currentLevel);
      setDisplayDb(currentDb);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentLevel, currentDb]);

  const config = LEVEL_CONFIG[displayLevel] || LEVEL_CONFIG[1];
  const percentage = (displayLevel / 5) * 100;

  // SVG arc for gauge
  const radius = 100;
  const strokeWidth = 12;
  const circumference = Math.PI * radius; // half circle
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="glass-card animate-fade-in" style={styles.container}>
      <h3 style={styles.heading}>Current Level</h3>

      <div style={styles.gaugeContainer}>
        {/* Outer glow */}
        <div
          style={{
            ...styles.glowRing,
            boxShadow: `0 0 60px ${config.bgGlow}, inset 0 0 60px ${config.bgGlow}`,
          }}
        />

        {/* SVG Gauge */}
        <svg width="240" height="140" viewBox="0 0 240 140" style={styles.svg}>
          {/* Background track */}
          <path
            d="M 20 130 A 100 100 0 0 1 220 130"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Active arc */}
          <path
            d="M 20 130 A 100 100 0 0 1 220 130"
            fill="none"
            stroke={config.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease',
              filter: `drop-shadow(0 0 8px ${config.color}80)`,
            }}
          />
        </svg>

        {/* Center content */}
        <div style={styles.centerContent}>
          <span
            style={{
              ...styles.levelNumber,
              color: config.color,
              textShadow: `0 0 20px ${config.color}60`,
            }}
          >
            {displayLevel || '—'}
          </span>
          <span style={styles.levelOf}>/5</span>
        </div>
      </div>

      {/* Label + dB */}
      <div style={styles.info}>
        <span
          style={{
            ...styles.levelLabel,
            color: config.color,
            background: config.bgGlow,
            border: `1px solid ${config.color}30`,
          }}
        >
          {displayLevel ? config.label : 'No Data'}
        </span>
        <span style={styles.dbValue}>
          {displayDb > 0 ? `${displayDb} dB` : '— dB'}
        </span>
      </div>

      {/* Level indicators */}
      <div style={styles.levelDots}>
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            style={{
              ...styles.dot,
              background:
                level <= displayLevel
                  ? LEVEL_CONFIG[level].color
                  : 'rgba(255,255,255,0.08)',
              boxShadow:
                level <= displayLevel
                  ? `0 0 8px ${LEVEL_CONFIG[level].color}60`
                  : 'none',
              transform: level <= displayLevel ? 'scale(1.1)' : 'scale(1)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
  },
  heading: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    alignSelf: 'flex-start',
  },
  gaugeContainer: {
    position: 'relative',
    width: '240px',
    height: '140px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -40%)',
    transition: 'box-shadow 0.8s ease',
    pointerEvents: 'none',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  centerContent: {
    position: 'absolute',
    bottom: '10px',
    display: 'flex',
    alignItems: 'baseline',
    gap: '2px',
  },
  levelNumber: {
    fontSize: '3.5rem',
    fontWeight: 800,
    lineHeight: 1,
    transition: 'color 0.4s ease, text-shadow 0.4s ease',
  },
  levelOf: {
    fontSize: '1.2rem',
    fontWeight: 500,
    color: '#64748b',
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.4rem',
  },
  levelLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  dbValue: {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#94a3b8',
  },
  levelDots: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  dot: {
    width: '28px',
    height: '6px',
    borderRadius: '3px',
    transition: 'all 0.4s ease',
  },
};
