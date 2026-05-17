export function Input({
  label,
  icon: Icon,
  prefix, // <-- NUEVA PROPIEDAD
  variant = "light", // 'light' | 'dark'
  className = "",
  error,
  ...props
}) {
  const isDark = variant === "dark";

  // 1. Calculamos dinámicamente el espacio izquierdo (padding-left)
  // Dependiendo de si usamos Icono, Prefijo, o ambos a la vez.
  let paddingLeft = "pl-4"; // Por defecto
  if (Icon && prefix)
    paddingLeft = "pl-[88px]"; // Espacio para ambos
  else if (Icon)
    paddingLeft = "pl-11"; // Espacio solo icono
  else if (prefix) paddingLeft = "pl-[60px]"; // Espacio solo prefijo

  const baseClasses = `w-full pr-4 py-3 rounded-xl outline-none transition-all text-sm font-medium ${paddingLeft}`;
  const darkClasses =
    "bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20";
  const lightClasses =
    "bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20";

  const errorClasses = error
    ? "border-red-500 ring-2 ring-red-500/20 focus:border-red-500 focus:ring-red-500/20"
    : "";

  return (
    <div>
      {label && (
        <label
          className={`block text-xs font-semibold mb-2 ml-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}
        >
          {label}
        </label>
      )}
      {/* Añadimos flex y items-center para asegurar que los elementos absolutos se centren bien */}
      <div className="relative flex items-center">
        {/* Renderizado Condicional del Icono */}
        {Icon && (
          <Icon
            size={16}
            // pointer-events-none evita que el icono bloquee el clic hacia el input
            className={`absolute left-4 ${error ? "text-red-400" : "text-slate-400"} pointer-events-none z-10`}
          />
        )}

        {/* Renderizado Condicional del Prefijo (+569) */}
        {prefix && (
          <div
            className={`absolute flex items-center ${Icon ? "left-10" : "left-4"} pr-2 border-r ${isDark ? "border-white/10" : "border-slate-200"} text-sm font-bold text-slate-500 pointer-events-none select-none z-10`}
          >
            {prefix}
          </div>
        )}

        {/* El Input real */}
        <input
          className={`${baseClasses} ${isDark ? darkClasses : lightClasses} ${errorClasses} ${className}`}
          {...props}
        />
      </div>

      {/* Mensaje de Error */}
      {error && (
        <p className="mt-1.5 ml-1 text-[10px] font-bold text-red-400 uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}
