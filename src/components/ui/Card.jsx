export function Card({ children, className = '', padding = 'md', ...props }) {
  const paddings = {
    none: '',
    sm:   'p-4',
    md:   'p-4 md:p-6',
    lg:   'p-6 md:p-8',
  };

  return (
    <div
      className={`bg-white border border-slate-200 rounded-2xl shadow-sm ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
