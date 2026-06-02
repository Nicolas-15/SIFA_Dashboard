import { X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  headerExtra,
  // Personalización
  maxWidth = 'max-w-xl',
  maxHeight = 'max-h-[90vh]',
  className = '',
  backdropClassName = '',
  headerClassName = '',
  titleClassName = '',
  descriptionClassName = '',
  bodyClassName = '',
  footerClassName = '',
  closeButtonClassName = '',
  headerIcon = null,
  closeOnBackdropClick = false,
}) {
  // Cerrar con la tecla Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 ${backdropClassName}`}
    >
      <div
        className={`bg-white rounded-[2rem] w-full ${maxWidth} ${maxHeight} flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 ${className}`}
      >
        
        {/* Header */}
        <div className={`flex items-center justify-between p-8 border-b border-slate-100 shrink-0 ${headerClassName}`}>
          <div className="flex items-center gap-3">
            {headerIcon && <div className="p-2 bg-primary/10 rounded-xl">{headerIcon}</div>}
            <div>
              <h3 className={`text-2xl font-black text-slate-800 tracking-tight ${titleClassName}`}>{title}</h3>
              {description && <p className={`text-sm text-slate-500 mt-1 ${descriptionClassName}`}>{description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {headerExtra}
            <button
              onClick={onClose}
              className={`w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all hover:rotate-90 shrink-0 ${closeButtonClassName}`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={`p-8 overflow-y-auto flex-1 ${bodyClassName}`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={`p-8 border-t border-slate-100 bg-slate-50/50 rounded-b-[2rem] shrink-0 ${footerClassName}`}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
