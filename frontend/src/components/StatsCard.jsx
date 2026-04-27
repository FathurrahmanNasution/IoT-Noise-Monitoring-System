import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatsCard({ icon: Icon, label, value, unit, trend, color, delay = 0 }) {
  const trendColor =
    trend === 'up' ? '#34d399' : trend === 'down' ? '#fb7185' : '#64748b';

  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div
      className={`glass-card animate-fade-in animate-fade-in-delay-${delay}`}
      style={styles.card}
    >
      <div style={styles.top}>
        <div
          style={{
            ...styles.iconBox,
            background: `${color}15`,
            border: `1px solid ${color}30`,
          }}
        >
          <Icon size={20} color={color} />
        </div>
        {trend && (
          <div style={{ ...styles.trendBadge, color: trendColor }}>
            <TrendIcon size={14} />
          </div>
        )}
      </div>

      <div style={styles.valueRow}>
        <span style={styles.value}>{value ?? '—'}</span>
        {unit && <span style={styles.unit}>{unit}</span>}
      </div>

      <span style={styles.label}>{label}</span>
    </div>
  );
}

const styles = {
  card: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    cursor: 'default',
    position: 'relative',
    overflow: 'hidden',
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBox: {
    width: '42px',
    height: '42px',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  valueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.35rem',
  },
  value: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#f1f5f9',
    lineHeight: 1,
  },
  unit: {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#94a3b8',
  },
  label: {
    fontSize: '0.8rem',
    color: '#64748b',
    fontWeight: 500,
  },
};
