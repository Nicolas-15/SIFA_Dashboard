import { X } from 'lucide-react';
import { useEffect } from 'react';

export function Modal({ isOpen, onClose, title, description, children, footer }) {
  // Cerrar con la tecla Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h3>
            {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all hover:rotate-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-8 border-t border-slate-100 bg-slate-50/50 rounded-b-[2rem] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
