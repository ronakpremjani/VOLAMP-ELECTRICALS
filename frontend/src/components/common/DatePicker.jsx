import React from 'react';
import { Calendar, X } from 'lucide-react';

export default function DatePicker({ value, onChange, placeholder = 'Select Date' }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <Calendar size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-light)', pointerEvents: 'none' }} />
      <input
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="form-input"
        style={{
          width: '100%',
          padding: '6px 28px 6px 30px',
          fontSize: '0.82rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: '8px',
            background: 'none',
            border: 'none',
            color: 'var(--text-light)',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
          }}
          title="Clear date"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
