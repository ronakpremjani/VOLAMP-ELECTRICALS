import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function DatePicker({ value, onChange, placeholder = 'Select Date', placement = 'auto' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentViewDate, setCurrentViewDate] = useState(value ? new Date(value) : new Date());
  const [openUpwards, setOpenUpwards] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setOpenUpwards(spaceBelow < 320 && spaceAbove > spaceBelow);
    }
    if (isOpen && value) {
      setCurrentViewDate(new Date(value));
    }
  }, [isOpen, placement, value]);

  const handlePrevMonth = () => {
    setCurrentViewDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentViewDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1, 1));
  };

  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days = [];
  
  // Previous month padding
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push({ day: daysInPrevMonth - firstDayOfMonth + i + 1, isCurrentMonth: false, isPrevMonth: true });
  }
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true });
  }
  // Next month padding
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({ day: i, isCurrentMonth: false, isNextMonth: true });
  }

  const handleSelectDate = (d) => {
    if (!d.isCurrentMonth) return;
    const selectedDate = new Date(year, month, d.day);
    // Format YYYY-MM-DD
    const yy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    onChange(`${yy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };
  
  const handleToday = (e) => {
    e.stopPropagation();
    const today = new Date();
    const yy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    onChange(`${yy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const formatDisplayDate = (val) => {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    const day = String(d.getDate()).padStart(2, '0');
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}-${m}-${d.getFullYear()}`;
  };

  return (
    <div ref={containerRef} className="custom-dropdown theme-date-picker" style={{ width: '100%', position: 'relative' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`custom-dropdown-trigger ${isOpen ? 'is-open' : ''}`}
        style={{ paddingRight: value ? '34px' : '12px', minWidth: '130px' }}
      >
        <div className="custom-dropdown-value">
          <CalendarIcon size={14} className="custom-dropdown-leading-icon" />
          <div className="custom-dropdown-text">
            {value ? (
              <span className="custom-dropdown-label">{formatDisplayDate(value)}</span>
            ) : (
              <span className="custom-dropdown-placeholder">{placeholder}</span>
            )}
          </div>
        </div>
      </button>

      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="theme-date-picker-clear"
          title="Clear date"
          style={{ zIndex: 10 }}
        >
          <X size={13} />
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: openUpwards ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: openUpwards ? 6 : -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="custom-calendar-popup"
            style={{
              position: 'absolute',
              left: 0,
              width: '260px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 1000,
              padding: '14px',
              marginTop: openUpwards ? 0 : '6px',
              marginBottom: openUpwards ? '6px' : 0,
              bottom: openUpwards ? '100%' : 'auto',
              top: openUpwards ? 'auto' : '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                {MONTHS[month]} {year}
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button type="button" className="cal-nav-btn" onClick={handlePrevMonth}>
                  <ChevronLeft size={16} />
                </button>
                <button type="button" className="cal-nav-btn" onClick={handleNextMonth}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '6px' }}>
              {DAYS_OF_WEEK.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {d}
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {days.map((d, i) => {
                const isSelected = value && d.isCurrentMonth && 
                  new Date(value).getDate() === d.day &&
                  new Date(value).getMonth() === month &&
                  new Date(value).getFullYear() === year;
                  
                const isToday = new Date().getDate() === d.day &&
                  new Date().getMonth() === month &&
                  new Date().getFullYear() === year && d.isCurrentMonth;

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!d.isCurrentMonth}
                    onClick={() => handleSelectDate(d)}
                    className={`cal-day-btn ${d.isCurrentMonth ? '' : 'is-disabled'} ${isSelected ? 'is-selected' : ''} ${isToday && !isSelected ? 'is-today' : ''}`}
                  >
                    {d.day}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
              <button type="button" onClick={handleClear} style={{ background: 'none', border: 'none', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>
                Clear
              </button>
              <button type="button" onClick={handleToday} style={{ background: 'none', border: 'none', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>
                Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
