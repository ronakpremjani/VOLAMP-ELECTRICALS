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
    <div ref={dropdownRef} className={`custom-dropdown ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`custom-dropdown-trigger ${isOpen ? 'is-open' : ''} ${error ? 'has-error' : ''}`}
      >
        <div className="custom-dropdown-value">
          {Icon && <Icon size={14} className="custom-dropdown-leading-icon" />}
          {selectedOption?.icon && <selectedOption.icon size={14} className="custom-dropdown-leading-icon" />}
          <div className="custom-dropdown-text">
            {selectedOption ? (
              <span className="custom-dropdown-label">{selectedOption.label}</span>
            ) : (
              <span className="custom-dropdown-placeholder">{placeholder}</span>
            )}
          </div>
        </div>
        <ChevronDown
          size={15}
          className="custom-dropdown-chevron"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: openUpwards ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: openUpwards ? 6 : -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="custom-dropdown-menu"
            style={{
              marginTop: openUpwards ? 0 : '4px',
              marginBottom: openUpwards ? '4px' : 0,
              bottom: openUpwards ? '100%' : 'auto',
              top: openUpwards ? 'auto' : '100%',
            }}
          >
            {searchable && (
              <div className="custom-dropdown-search-wrap">
                <Search size={14} className="custom-dropdown-search-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="custom-dropdown-search"
                />
              </div>
            )}

            <div className="custom-dropdown-options">
              {filteredOptions.length === 0 ? (
                <div className="custom-dropdown-empty">
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
                      className={`custom-dropdown-option ${isSelected ? 'is-selected' : ''}`}
                    >
                      <div className="custom-dropdown-option-main">
                        {OptIcon && <OptIcon size={14} className="custom-dropdown-option-icon" />}
                        <div className="custom-dropdown-option-copy">
                          <div className="custom-dropdown-option-label">{opt.label}</div>
                          {opt.sublabel && (
                            <div className="custom-dropdown-option-sublabel">
                              {opt.sublabel}
                            </div>
                          )}
                        </div>
                      </div>
                      {isSelected && <Check size={14} className="custom-dropdown-check" />}
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
