export function Button({
  type = 'button',
  children,
  isLoading = false,
  loadingText = 'Cargando...',
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'success' | 'warning'
  size = 'md',         // 'sm' | 'md' | 'lg' | 'icon'
  className = '',
  ...props
}) {
  const sizes = {
    sm:   'px-3 py-1.5 text-xs rounded-lg font-bold gap-1.5',
    md:   'w-full py-3.5 rounded-xl text-sm font-bold gap-2',
    lg:   'w-full py-4 rounded-2xl text-base font-bold gap-2',
    icon: 'p-2 rounded-lg',
  };

  const variants = {
    primary:   'bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 text-white hover:-translate-y-0.5',
    secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-700 hover:-translate-y-0.5',
    danger:    'bg-red-500 hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 text-white hover:-translate-y-0.5',
    outline:   'border border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary',
    ghost:     'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700 shadow-none',
    success:   'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    warning:   'bg-amber-50 text-amber-700 hover:bg-amber-100',
  };

  const baseClasses = 'inline-flex items-center justify-center tracking-wide shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
  const loadingClasses = 'opacity-70 cursor-wait shadow-none transform-none';

  return (
    <button
      type={type}
      disabled={isLoading || props.disabled}
      className={`${baseClasses} ${sizes[size]} ${variants[variant]} ${isLoading ? loadingClasses : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin shrink-0" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
