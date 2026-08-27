import React from 'react';

const COLOR_MAP = {
  blue:    { accent: 'var(--color-blue)',    iconBg: 'var(--color-blue-bg)',    iconColor: 'var(--color-blue)' },
  emerald: { accent: 'var(--color-emerald)', iconBg: 'var(--color-emerald-bg)', iconColor: 'var(--color-emerald)' },
  amber:   { accent: 'var(--color-amber)',   iconBg: 'var(--color-amber-bg)',   iconColor: 'var(--color-amber)' },
  rose:    { accent: 'var(--color-rose)',    iconBg: 'var(--color-rose-bg)',    iconColor: 'var(--color-rose)' },
  violet:  { accent: 'var(--color-violet)',  iconBg: 'var(--color-violet-bg)',  iconColor: 'var(--color-violet)' },
  cyan:    { accent: '#0284c7', iconBg: 'rgba(14,165,233,0.1)', iconColor: '#0284c7' },
  orange:  { accent: 'var(--primary)',       iconBg: 'var(--primary-light)',    iconColor: 'var(--primary)' },
};

export default function MetricCard({ label, value, icon: Icon, color = 'blue', prefix = '', suffix = '' }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <div
      className="kpi-card"
      style={{ '--kpi-accent': c.accent, '--kpi-icon-bg': c.iconBg, '--kpi-icon-color': c.iconColor }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div className="kpi-label">{label}</div>
        {Icon && (
          <div
            className="kpi-icon-wrap"
            style={{ background: c.iconBg, color: c.iconColor }}
          >
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className="kpi-value">
        {prefix}
        {typeof value === 'number' ? value.toLocaleString('en-IN') : (value || 0)}
        {suffix}
      </div>
    </div>
  );
}
