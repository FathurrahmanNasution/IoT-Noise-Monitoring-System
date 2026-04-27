import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

const TIME_WINDOWS = [
  { label: '5m', minutes: 5 },
  { label: '15m', minutes: 15 },
  { label: '1h', minutes: 60 },
  { label: 'All', minutes: null },
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;
  const time = new Date(d.recorded_at).toLocaleTimeString();
  return (
    <div style={{
      background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem',
      padding: '0.75rem 1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      minWidth: '140px',
    }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>{time}</div>
      <div style={{ display:'flex', justifyContent:'space-between', padding:'0.2rem 0' }}>
        <span style={{ fontSize:'0.75rem', color:'#94a3b8' }}>Level</span>
        <span style={{ fontSize:'0.8rem', fontWeight:600, color:'#f1f5f9' }}>{d.noise_level}/5</span>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', padding:'0.2rem 0' }}>
        <span style={{ fontSize:'0.75rem', color:'#94a3b8' }}>dB</span>
        <span style={{ fontSize:'0.8rem', fontWeight:600, color:'#f1f5f9' }}>{d.decibel_value?.toFixed(1)}</span>
      </div>
    </div>
  );
}

export default function NoiseChart({ history }) {
  const [activeWindow, setActiveWindow] = useState('All');

  const filteredData = (() => {
    const w = TIME_WINDOWS.find((w) => w.label === activeWindow);
    if (!w || !w.minutes) return history;
    const cutoff = new Date(Date.now() - w.minutes * 60 * 1000);
    return history.filter((r) => new Date(r.recorded_at) >= cutoff);
  })();

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Noise History</h3>
        <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.5rem', padding: '0.2rem' }}>
          {TIME_WINDOWS.map((w) => (
            <button key={w.label} onClick={() => setActiveWindow(w.label)}
              style={{
                padding: '0.3rem 0.7rem', borderRadius: '0.4rem', border: 'none',
                background: activeWindow === w.label ? 'rgba(99,102,241,0.2)' : 'transparent',
                color: activeWindow === w.label ? '#a5b4fc' : '#64748b',
                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 150ms ease',
                boxShadow: activeWindow === w.label ? '0 0 12px rgba(99,102,241,0.15)' : 'none',
              }}>{w.label}</button>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', minHeight: '280px' }}>
        {filteredData.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '280px', color: '#64748b', fontSize: '0.9rem', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>📊</span>
            <span>No data in this time window</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="noiseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#6366f1" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="recorded_at" tickFormatter={formatTime} stroke="#475569"
                tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                tickLine={false} interval="preserveStartEnd" minTickGap={60} />
              <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#475569"
                tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={3} stroke="rgba(251,191,36,0.3)" strokeDasharray="6 4" />
              <Area type="monotone" dataKey="noise_level" stroke="#6366f1" strokeWidth={2}
                fill="url(#noiseGradient)" dot={false}
                activeDot={{ r: 5, stroke: '#6366f1', strokeWidth: 2, fill: '#1e1b4b' }}
                animationDuration={800} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
