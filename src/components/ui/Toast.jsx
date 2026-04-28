import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`
      fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3.5
      rounded-xl shadow-2xl border
      animate-in slide-in-from-bottom-4 duration-300
      ${type === 'success'
        ? 'bg-white border-emerald-200 text-emerald-800'
        : 'bg-white border-red-200 text-red-800'
      }
    `}>
      {type === 'success'
        ? <CheckCircle size={18} className="text-emerald-500 shrink-0" />
        : <AlertCircle size={18} className="text-red-500 shrink-0" />
      }
      <p className="text-sm font-semibold whitespace-pre-line">{message}</p>
      <button onClick={onClose} className="ml-1 opacity-40 hover:opacity-80 transition-opacity">
        <X size={15} />
      </button>
    </div>
  );
}
