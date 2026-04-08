const KPI_STYLES = {
  primary: { bg: 'bg-primary/10', icon: 'text-primary', num: 'text-primary' },
  warning: { bg: 'bg-amber-100', icon: 'text-amber-600', num: 'text-amber-700' },
  secondary: { bg: 'bg-emerald-100', icon: 'text-emerald-600', num: 'text-emerald-700' },
  slate: { bg: 'bg-slate-100', icon: 'text-slate-500', num: 'text-slate-700' },
};

export function KpiCard({ title, value, color, icon }) {
  const s = KPI_STYLES[color] ?? KPI_STYLES.slate;
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight">
            {title}
          </p>
          <p className={`text-3xl md:text-4xl font-black mt-1.5 ${s.num}`}>{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl shrink-0 ${s.bg}`}>
          <span className={s.icon}>{icon}</span>
        </div>
      </div>
    </div>
  );
}
