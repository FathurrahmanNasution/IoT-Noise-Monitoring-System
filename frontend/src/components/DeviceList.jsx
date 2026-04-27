import { Smartphone, Clock } from 'lucide-react';

const LEVEL_COLORS = {
  1: '#34d399', 2: '#6ee7b7', 3: '#fbbf24', 4: '#f97316', 5: '#ef4444',
};

export default function DeviceList({ latestReadings }) {
  if (!latestReadings || latestReadings.length === 0) {
    return (
      <div className="glass-card animate-fade-in" style={styles.container}>
        <h3 style={styles.heading}>Connected Devices</h3>
        <div style={styles.empty}>
          <Smartphone size={32} color="#334155" />
          <span>No devices reporting</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card animate-fade-in" style={styles.container}>
      <div style={styles.headerRow}>
        <h3 style={styles.heading}>Connected Devices</h3>
        <span style={styles.count}>{latestReadings.length} device{latestReadings.length > 1 ? 's' : ''}</span>
      </div>
      <div style={styles.list}>
        {latestReadings.map((reading) => {
          const ago = getTimeAgo(reading.recorded_at);
          const isActive = (Date.now() - new Date(reading.recorded_at).getTime()) < 30000;
          const color = LEVEL_COLORS[reading.noise_level] || '#64748b';

          return (
            <div key={reading.device_id} style={styles.item}>
              <div style={styles.itemLeft}>
                <div style={{ ...styles.statusDot, background: isActive ? '#34d399' : '#475569', boxShadow: isActive ? '0 0 6px rgba(52,211,153,0.5)' : 'none' }} />
                <div style={styles.deviceInfo}>
                  <span style={styles.deviceId}>{reading.device_id}</span>
                  <span style={styles.timeAgo}><Clock size={10} /> {ago}</span>
                </div>
              </div>
              <div style={styles.itemRight}>
                <div style={{ ...styles.levelBadge, background: `${color}20`, color, border: `1px solid ${color}30` }}>
                  Lv.{reading.noise_level}
                </div>
                <span style={styles.dbText}>{reading.decibel_value?.toFixed(1)} dB</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getTimeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 10) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

const styles = {
  container: { padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  heading: { fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' },
  count: { fontSize: '0.75rem', fontWeight: 500, color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '9999px' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', transition: 'all 200ms ease' },
  itemLeft: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  statusDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, transition: 'all 300ms ease' },
  deviceInfo: { display: 'flex', flexDirection: 'column', gap: '0.15rem' },
  deviceId: { fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  timeAgo: { fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' },
  itemRight: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  levelBadge: { fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '0.4rem' },
  dbText: { fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8', minWidth: '55px', textAlign: 'right' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: '#475569', gap: '0.75rem', fontSize: '0.85rem' },
};
