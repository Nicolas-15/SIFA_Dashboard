import { useState, useEffect } from 'react';
import { Search, Menu } from 'lucide-react';
import { Sidebar } from './components/layout/Sidebar';
import { Toast } from './components/ui/Toast';
import { DashboardView } from './components/dashboard/DashboardView';
import { InfraccionesView } from './components/infracciones/InfraccionesView';
import { LoginView } from './components/auth/LoginView';
import { RecoveryView } from './components/auth/RecoveryView';
import { UserManagementView } from './components/usuarios/UserManagementView';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [infractions, setInfractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [headerSearch, setHeaderSearch] = useState('');

  // Estados de Autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState('login'); // 'login' o 'recovery'

  useEffect(() => {
    fetch('http://localhost:8000/infractions')
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { setInfractions(data); setLoading(false); })
      .catch(err => { console.error('Error fetching data:', err); setError(true); setLoading(false); });
  }, []);

  /* Actualiza el estado localmente (optimista) y persiste en la API */
  const updateStatus = async (id, newStatus) => {
    setInfractions(prev =>
      prev.map(inf => inf.id === id ? { ...inf, status: newStatus } : inf)
    );
    try {
      const res = await fetch(`http://localhost:8000/infractions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.error('Error al persistir estado en la API:', err);
      showToast('⚠️ No se pudo guardar el cambio en el servidor', 'error');
    }
  };

  /* Actualiza todos los campos de una infracción (modo edición) — solo estado local */
  const updateInfraction = (id, updatedFields) => {
    setInfractions(prev =>
      prev.map(inf => inf.id === id ? { ...inf, ...updatedFields } : inf)
    );
  };

  const showToast = (message, type = 'success') =>
    setToast({ message, type, key: Date.now() });

  const navigate = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const todayLabel = new Date().toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const todayCapitalized = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);

  const handleLogin = (email, password) => {
    // Validamos credenciales hardcodeadas (quemadas) tal cual pidieron
    if (email === 'admin@elquisco.cl' && password === '123456') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthView('login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
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
            El servidor de la API no está disponible.<br />
            Asegúrate de que <span className="font-mono font-bold text-slate-700">FAKE_API</span> esté corriendo en el puerto 8000.
          </p>
          <button
            onClick={() => { setError(false); setLoading(true); fetch('http://localhost:8000/infractions').then(r => r.json()).then(d => { setInfractions(d); setLoading(false); }).catch(() => { setError(true); setLoading(false); }); }}
            className="px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-dark transition-colors"
          >
            Reintentar conexión
          </button>
        </div>
      </div>
    );
  }

  // Si no está autenticado, interceptamos todo y dibujamos las pantallas de acceso
  if (!isAuthenticated) {
    return (
      <div className="h-screen w-full font-sans text-slate-800 bg-slate-900">
        {authView === 'login' ? (
          <LoginView 
            onLogin={handleLogin} 
            onNavigateToRecovery={() => setAuthView('recovery')} 
          />
        ) : (
          <RecoveryView 
            onNavigateToLogin={() => setAuthView('login')} 
          />
        )}
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

      {/*── Sidebar (drawer en móvil, fijo en desktop) ──*/}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-40
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <Sidebar
          activeTab={activeTab}
          onNavigate={navigate}
          onClose={() => setSidebarOpen(false)}
          pendingCount={infractions.filter(i => i.status === 'pending').length}
          onLogout={handleLogout}
        />
      </div>

      {/* ── Contenido principal ── */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Header */}
        <header className="h-14 md:h-16 flex items-center gap-3 px-4 md:px-6 border-b border-slate-200 bg-white/90 backdrop-blur-md z-10 shrink-0">
          {/* Hamburger — solo móvil */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          >
            <Menu size={20} />
          </button>

          {/* Fecha del día */}
          <div className="hidden sm:block mr-auto">
            <p className="text-xs text-slate-500 font-medium leading-tight">{todayCapitalized}</p>
          </div>

          {/* Buscador */}
          <div className="flex items-center bg-slate-100 rounded-full px-3 py-2 border border-slate-200 flex-1 sm:flex-none sm:w-56 lg:w-72">
            <Search size={15} className="text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Buscar en infracciones..."
              className="bg-transparent border-none outline-none text-sm text-slate-800 w-full placeholder:text-slate-400"
              value={headerSearch}
              onChange={e => { setHeaderSearch(e.target.value); navigate('infracciones'); }}
              onFocus={() => navigate('infracciones')}
            />
          </div>
        </header>

        {/* Vista activa */}
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <DashboardView infractions={infractions} />
          )}
          {activeTab === 'infracciones' && (
            <InfraccionesView
              infractions={infractions}
              updateStatus={updateStatus}
              updateInfraction={updateInfraction}
              showToast={showToast}
              headerSearch={headerSearch}
              onClearHeaderSearch={() => setHeaderSearch('')}
            />
          )}
          {activeTab === 'usuarios' && (
            <UserManagementView showToast={showToast} />
          )}
        </div>
      </main>

      {/* Toast de notificación */}
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

export default App;
