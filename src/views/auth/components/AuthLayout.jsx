export function AuthLayout({ children, icon: Icon, iconColorClass, title, subtitle }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden">

      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-60" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] opacity-50" />
      </div>

      <div className="w-full max-w-sm px-4 relative z-10">
        
        {/* Header/Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-lg mb-6 relative overflow-hidden group">
            <Icon size={32} className={iconColorClass} />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-widest leading-tight">
            {title}
          </h1>
          <p className="text-slate-400 mt-2 font-medium text-sm">
            {subtitle}
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl">
          {children}
        </div>
        
      </div>
    </div>
  );
}
