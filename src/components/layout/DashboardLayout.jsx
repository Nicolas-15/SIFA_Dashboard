import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, Shield } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Toast } from '../ui/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { useInfractions } from '../../hooks/useInfractions';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [headerSearch, setHeaderSearch] = useState('');
  
  const { currentUser, logout } = useAuth();
  const { infractions, loading, error, fetchInfractions, updateStatus, updateInfractionLocal } = useInfractions();
  
  const navigate = useNavigate();
  const location = useLocation();

  const showToast = (message, type = 'success') =>
    setToast({ message, type, key: Date.now() });

  const pendingCount = infractions.filter(i => i.status === 'pending').length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const todayLabel = new Date().toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const todayCapitalized = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
          <p className="text-sm text-slate-500 font-medium">Cargando infracciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center max-w-sm px-6">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-2">No se pudo conectar</h2>
          <p className="text-sm text-slate-500 mb-6">
            El servidor de la API no está disponible.
          </p>
          <button
            onClick={fetchInfractions}
            className="px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-dark transition-colors"
          >
            Reintentar conexión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-40
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <Sidebar
          onClose={() => setSidebarOpen(false)}
          pendingCount={pendingCount}
          onLogout={handleLogout}
          currentUser={currentUser}
        />
      </div>

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Header */}
        <header className="h-14 md:h-16 flex items-center gap-3 px-4 md:px-6 border-b border-slate-200 bg-white/90 backdrop-blur-md z-10 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          >
            <Menu size={20} />
          </button>

          <div className="hidden sm:block mr-auto">
            <p className="text-xs text-slate-500 font-medium leading-tight">{todayCapitalized}</p>
          </div>

          <div className="flex items-center bg-slate-100 rounded-full px-3 py-2 border border-slate-200 flex-1 sm:flex-none sm:w-56 lg:w-72">
            <Search size={15} className="text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Buscar en infracciones..."
              className="bg-transparent border-none outline-none text-sm text-slate-800 w-full placeholder:text-slate-400"
              value={headerSearch}
              onChange={e => { setHeaderSearch(e.target.value); navigate('/infracciones'); }}
              onFocus={() => navigate('/infracciones')}
            />
          </div>
        </header>

        {/* Renderizado de Vistas Hijas */}
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Outlet context={{
            infractions,
            updateStatus,
            updateInfractionLocal,
            showToast,
            headerSearch,
            onClearHeaderSearch: () => setHeaderSearch(''),
            fetchInfractions,
            currentUser
          }} />
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
