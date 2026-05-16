export function Input({
  label,
  icon: Icon,
  variant = 'light', // 'light' | 'dark'
  className = '',
  error,
  ...props
}) {
  const isDark = variant === 'dark';
  
  const baseClasses = "w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all text-sm font-medium";
  const darkClasses = "bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20";
  const lightClasses = "bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20";
  
  const errorClasses = error ? "border-red-500 ring-2 ring-red-500/20 focus:border-red-500 focus:ring-red-500/20" : "";

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
            className={`absolute left-4 top-1/2 -translate-y-1/2 ${error ? 'text-red-400' : 'text-slate-400'}`} 
          />
        )}
        <input
          className={`${baseClasses} ${isDark ? darkClasses : lightClasses} ${errorClasses} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 ml-1 text-[10px] font-bold text-red-400 uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}
