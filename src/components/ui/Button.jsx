export function Button({
  type = 'button',
  children,
  isLoading = false,
  loadingText = 'Cargando...',
  variant = 'primary', // 'primary' | 'secondary' | 'danger'
  className = '',
  ...props
}) {
  const baseClasses = "w-full py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-lg transition-all duration-300 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-primary hover:bg-primary/90 hover:shadow-primary/50 text-white hover:-translate-y-0.5",
    secondary: "bg-slate-200 hover:bg-slate-300 hover:shadow-slate-500/30 text-slate-700 hover:-translate-y-0.5",
    danger: "bg-red-500 hover:bg-red-600 hover:shadow-red-500/50 text-white hover:-translate-y-0.5"
  };

  const loadingClasses = "bg-opacity-70 cursor-wait shadow-none transform-none";

  return (
    <button
      type={type}
      disabled={isLoading || props.disabled}
      className={`${baseClasses} ${variants[variant]} ${isLoading ? loadingClasses : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
