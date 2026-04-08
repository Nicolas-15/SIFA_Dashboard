export const STATUS_MAP = {
  pending: { label: 'PENDIENTE', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  accepted: { label: 'ACEPTADA', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  exported: { label: 'EXPORTADA', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export function StatusBadge({ status, tiny = false }) {
  const { label, cls } = STATUS_MAP[status] ?? STATUS_MAP.exported;
  return (
    <span className={`
      inline-flex items-center rounded-full border uppercase tracking-wider font-bold
      ${tiny ? 'px-1.5 py-px text-[9px]' : 'px-2.5 py-0.5 text-[10px]'}
      ${cls}
    `}>
      {label}
    </span>
  );
}
