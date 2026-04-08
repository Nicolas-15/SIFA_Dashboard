import { X, User, LayoutDashboard, Receipt } from 'lucide-react';

function NavItem({ icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
        transition-all duration-150 text-sm font-semibold
        ${active
          ? 'bg-primary text-white shadow-sm'
          : 'text-slate-400 hover:bg-white/10 hover:text-white'
        }
      `}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {badge > 0 && (
        <span className={`
          min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-black
          flex items-center justify-center
          ${active ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}
        `}>
          {badge}
        </span>
      )}
    </button>
  );
}

export function Sidebar({ activeTab, onNavigate, onClose, pendingCount = 0 }) {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0">

      {/* Logo */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black text-lg shrink-0">
            S
          </div>
          <div>
            <h1 className="text-base font-bold tracking-widest text-white leading-tight">
              SIFA <span className="text-secondary">El Quisco</span>
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">I. Municipalidad de El Quisco</p>
          </div>
        </div>
        {/* Botón cerrar — solo en móvil */}
        <button onClick={onClose} className="md:hidden p-1 text-slate-400 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-1">
        <NavItem
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          active={activeTab === 'dashboard'}
          onClick={() => onNavigate('dashboard')}
        />
        <NavItem
          icon={<Receipt size={18} />}
          label="Infracciones"
          active={activeTab === 'infracciones'}
          onClick={() => onNavigate('infracciones')}
          badge={pendingCount}
        />
      </nav>

      {/* Usuario */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
            <User size={18} className="text-slate-300" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">Inspector Admin</p>
            <p className="text-xs text-slate-400">ID: ADM-001</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
