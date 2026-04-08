export function DetailCard({ icon, title, value, sub, highlight }) {
  return (
    <div className={`
      p-3 md:p-4 rounded-xl border flex gap-3 items-start
      ${highlight ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 border-slate-200'}
    `}>
      <div className={`
        mt-0.5 p-2 rounded-lg shrink-0
        ${highlight ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'}
      `}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{title}</p>
        <p className={`font-bold text-sm truncate ${highlight ? 'text-primary' : 'text-slate-800'}`}>
          {value}
        </p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
