import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search } from 'lucide-react';

export default function CustomDropdown({
  options = [],
  value,
  onChange,
  placeholder = 'Select option',
  icon: Icon,
  searchable = false,
  searchPlaceholder = 'Search...',
  disabled = false,
  error = false,
  className = '',
  placement = 'auto',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openUpwards, setOpenUpwards] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      if (searchable) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, searchable]);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      if (placement === 'top') {
        setOpenUpwards(true);
      } else if (placement === 'bottom') {
        setOpenUpwards(false);
      } else {
        const rect = dropdownRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        setOpenUpwards(spaceBelow < 220 && spaceAbove > spaceBelow);
      }
    }
  }, [isOpen, placement]);

  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: opt, label: String(opt) };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value));

  const filteredOptions = searchable && searchTerm.trim()
    ? normalizedOptions.filter((opt) => {
        const labelMatch = (opt.label || '').toLowerCase().includes(searchTerm.toLowerCase());
        const sublabelMatch = (opt.sublabel || '').toLowerCase().includes(searchTerm.toLowerCase());
        return labelMatch || sublabelMatch;
      })
    : normalizedOptions;

  const handleSelect = (optValue) => {
    onChange(optValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="form-input"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1, overflow: 'hidden' }}>
          {Icon && <Icon size={14} style={{ color: 'var(--text-light)', flexShrink: 0 }} />}
          {selectedOption?.icon && <selectedOption.icon size={14} style={{ color: 'var(--text-light)', flexShrink: 0 }} />}
          <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {selectedOption ? (
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{selectedOption.label}</span>
            ) : (
              <span style={{ color: 'var(--text-light)' }}>{placeholder}</span>
            )}
          </div>
        </div>
        <ChevronDown
          size={15}
          style={{
            color: 'var(--text-light)',
            flexShrink: 0,
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: openUpwards ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: openUpwards ? 6 : -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              zIndex: 9999,
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-xl)',
              marginTop: openUpwards ? 0 : '4px',
              marginBottom: openUpwards ? '4px' : 0,
              bottom: openUpwards ? '100%' : 'auto',
              top: openUpwards ? 'auto' : '100%',
              maxHeight: '260px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Search Input if Searchable */}
            {searchable && (
              <div style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px 6px 28px',
                    fontSize: '0.82rem',
                    background: 'var(--bg-input)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    outline: 'none',
                  }}
                />
              </div>
            )}

            {/* Options List */}
            <div style={{ overflowY: 'auto', padding: '4px', flex: 1 }}>
              {filteredOptions.length === 0 ? (
                <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  No options found
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = String(opt.value) === String(value);
                  const OptIcon = opt.icon;
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: isSelected ? 700 : 500,
                        background: isSelected ? 'var(--primary-light)' : 'transparent',
                        color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        {OptIcon && <OptIcon size={14} style={{ color: isSelected ? 'var(--primary)' : 'var(--text-light)' }} />}
                        <div>
                          <div>{opt.label}</div>
                          {opt.sublabel && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                              {opt.sublabel}
                            </div>
                          )}
                        </div>
                      </div>
                      {isSelected && <Check size={14} color="var(--primary)" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
