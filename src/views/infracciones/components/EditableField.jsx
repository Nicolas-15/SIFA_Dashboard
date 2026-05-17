import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

/**
 * Campo que alterna entre modo lectura (readonly estilizado) y edición
 * (Input o Select según si recibe `options`).
 */
export function EditableField({
  editing,
  value,
  onChange,
  type = 'text',
  options,
  mono = false,
  textColor = 'text-slate-800',
  align = 'text-left',
}) {
  const safeVal = value || '';

  if (!editing) {
    if (type === 'textarea') {
      return (
        <div
          className={`w-full text-sm px-3 py-1.5 border-transparent bg-transparent
            cursor-default font-semibold whitespace-pre-wrap break-words leading-relaxed
            ${textColor} ${mono ? 'font-mono' : ''} tracking-wide ${align}`}
        >
          {safeVal || '-'}
        </div>
      );
    }
    return (
      <input
        type="text"
        value={safeVal || '-'}
        readOnly
        className={`w-full text-sm rounded-lg border px-3 py-2 border-transparent bg-transparent
          cursor-default pointer-events-none truncate font-semibold outline-none h-[38px]
          ${textColor} ${mono ? 'font-mono' : ''} tracking-wide ${align}`}
      />
    );
  }

  if (options) {
    return (
      <Select
        options={options}
        value={safeVal}
        onChange={e => onChange(e.target.value)}
        placeholder="- Seleccione -"
        className={`!pl-4 font-semibold h-[38px] ${mono ? 'font-mono' : ''} tracking-wide`}
      />
    );
  }

  if (type === 'textarea') {
    return (
      <textarea
        value={safeVal}
        onChange={e => onChange(e.target.value)}
        rows={3}
        className={`w-full text-sm rounded-lg border border-slate-200 px-3 py-2 font-semibold outline-none
          focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 tracking-wide resize-y ${align}`}
      />
    );
  }

  return (
    <Input
      type={type}
      value={safeVal}
      onChange={e => onChange(e.target.value)}
      className={`!pl-4 font-semibold h-[38px] ${mono ? 'font-mono' : ''} tracking-wide ${align}`}
    />
  );
}
