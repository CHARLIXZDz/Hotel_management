import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';
import { formatDateDDMMYY } from '../utils/date';

export default function DateInput({
  value,
  onChange,
  min,
  max,
  required = false,
  className = '',
  disabled = false,
  id,
  name,
  placeholder = 'DD/MM/YYYY'
}) {
  const dateInputRef = useRef(null);

  // Formatted value strictly in DD/MM/YYYY
  const displayValue = value ? formatDateDDMMYY(value) : '';

  const handleClick = () => {
    if (disabled) return;
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        try {
          dateInputRef.current.showPicker();
        } catch (e) {
          dateInputRef.current.focus();
        }
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative flex items-center justify-between cursor-pointer select-none transition-all ${className}`}
    >
      {/* 1. Visible formatted date string strictly in DD/MM/YYYY */}
      <span
        className={`text-sm font-medium tracking-wide ${
          displayValue
            ? 'text-slate-900 dark:text-slate-100 font-semibold'
            : 'text-slate-400 dark:text-slate-500'
        }`}
      >
        {displayValue || placeholder}
      </span>

      {/* 2. Calendar Icon */}
      <Calendar className="w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-colors pointer-events-none shrink-0" />

      {/* 3. Invisible Native Date Input anchoring the system date picker */}
      <input
        ref={dateInputRef}
        type="date"
        id={id}
        name={name}
        min={min}
        max={max}
        required={required}
        disabled={disabled}
        value={value || ''}
        onChange={onChange}
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
      />
    </div>
  );
}
