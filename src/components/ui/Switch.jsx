export function Switch({ checked, onChange, disabled, label, className = "" }) {
  return (
    <label className={`flex items-center justify-between gap-3 select-none ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}>
      {label && <span className="text-sm text-slate-700 font-medium">{label}</span>}
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div className={`block w-10 h-6 rounded-full transition-colors duration-200 ${checked ? "bg-red-500" : "bg-slate-300"}`} />
        <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0"}`} />
      </div>
    </label>
  );
}
