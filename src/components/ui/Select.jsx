export function Select({
  label,
  icon: Icon,
  variant = 'light', // 'light' | 'dark'
  options = [],      // [{ value, label }] o [string]
  placeholder,
  className = '',
  ...props
}) {
  const isDark = variant === 'dark';

  const baseClasses = 'w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all text-sm font-medium appearance-none cursor-pointer';
  const darkClasses  = 'bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20';
  const lightClasses = 'bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20';

  return (
    <div>
      {label && (
        <label className={`block text-xs font-semibold mb-2 ml-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-400'}`}
          />
        )}
        <select
          className={`${baseClasses} ${isDark ? darkClasses : lightClasses} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((opt) =>
            typeof opt === 'string'
              ? <option key={opt} value={opt}>{opt}</option>
              : <option key={opt.value} value={opt.value}>{opt.label}</option>
          )}
        </select>
        {/* Chevron icon */}
        <svg
          className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
