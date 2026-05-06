import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, User, Users, LayoutDashboard, Receipt, LogOut, AlertTriangle, ShieldCheck } from 'lucide-react';
import { SYSTEM_ROLES } from '@/constants/roles';

function NavItem({ icon, label, path, badge }) {
  const location = useLocation();
  const navigate = useNavigate();
  const active = location.pathname.includes(path);

  return (
    <button
      onClick={() => navigate(`/${path}`)}
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

export function Sidebar({ onClose, pendingCount = 0, onLogout, currentUser }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0">

      {/* Logo */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black text-lg shrink-0 overflow-hidden relative group">
            <ShieldCheck size={20} className="relative z-10" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-widest text-white leading-tight">
              SIFA <span className="text-secondary text-xs align-top font-black">PRO</span>
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">I. Municipalidad de El Quisco</p>
          </div>
        </div>
        <button onClick={onClose} className="md:hidden p-1 text-slate-400 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-1">
        <NavItem
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          path="dashboard"
        />
        <NavItem
          icon={<Receipt size={18} />}
          label="Infracciones"
          path="infracciones"
          badge={pendingCount}
        />
        {currentUser?.role === SYSTEM_ROLES.ADMIN && (
          <NavItem
            icon={<Users size={18} />}
            label="Gestión de Usuarios"
            path="usuarios"
          />
        )}
      </nav>

      {/* Usuario + Logout */}
      <div className="p-4 border-t border-white/10">
        {showLogoutConfirm ? (
          <div className="bg-slate-800 border border-red-500/30 rounded-xl p-3 space-y-3 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle size={15} className="shrink-0" />
              <p className="text-xs font-bold">¿Cerrar sesión?</p>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Perderás el acceso hasta que vuelvas a iniciar sesión.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-1.5 text-xs font-bold text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onLogout}
                className="flex-1 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Sí, salir
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
              <User size={18} className="text-slate-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {currentUser ? `${currentUser.name} ${currentUser.lastname}` : 'Cargando...'}
              </p>
              <p className="text-[10px] text-slate-400">
                {currentUser ? currentUser.role : '...'}
              </p>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
