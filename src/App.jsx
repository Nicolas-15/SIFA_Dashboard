import { useState, useEffect } from 'react';
import { Search, Menu, Shield } from 'lucide-react';
import { Sidebar } from './components/layout/Sidebar';
import { Toast } from './components/ui/Toast';
import { DashboardView } from './components/dashboard/DashboardView';
import { InfraccionesView } from './components/infracciones/InfraccionesView';
import { LoginView } from './components/auth/LoginView';
import { RecoveryView } from './components/auth/RecoveryView';
import { UserManagementView } from './components/usuarios/UserManagementView';

// Función para decodificar JWT sin librerías externas
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [infractions, setInfractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [headerSearch, setHeaderSearch] = useState('');

  // Estados de Autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch (e) { return null; }
  });
  const [authView, setAuthView] = useState('login'); // 'login' o 'recovery'

  useEffect(() => {
    fetch('/api/infractions', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
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
      const res = await fetch(`/api/infractions/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
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

  const handleLogin = async (email, password) => {
    try {
      const res = await fetch('/auth-api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
      });
      if (!res.ok) {
        return false;
      }
      const data = await res.json();
      
      // Decodificar token para obtener roles y simular el objeto user que el frontend espera
      const payload = decodeJWT(data.token);
      let userRole = "Administrativo JPL";
      
      if (payload && payload.roles) {
        if (payload.roles.includes("ADMIN") || payload.roles.includes("SUPER_ADMIN")) {
          userRole = "Administrador";
        }
      }

      // Crear un objeto de usuario compatible con el Dashboard
      const mappedUser = {
        name: data.username || payload?.sub || email,
        lastname: "(Autenticado vía JWT)",
        rut: "00.000.000-0",
        email: email,
        role: userRole
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(mappedUser));
      setCurrentUser(mappedUser);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      console.error("Login fetch error:", err);
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
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
            onClick={() => { setError(false); setLoading(true); fetch('/api/infractions', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }).then(r => r.json()).then(d => { setInfractions(d); setLoading(false); }).catch(() => { setError(true); setLoading(false); }); }}
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
          currentUser={currentUser}
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
              currentUser={currentUser}
            />
          )}
          {activeTab === 'usuarios' && currentUser?.role === 'Administrador' && (
            <UserManagementView showToast={showToast} />
          )}
          {activeTab === 'usuarios' && currentUser?.role !== 'Administrador' && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-sm pb-10">
              <Shield size={64} className="mb-4 text-slate-300" />
              <h2 className="text-xl font-black text-slate-700 uppercase tracking-widest">Acceso Denegado</h2>
              <p className="font-semibold text-sm mt-3">Tu rol de {currentUser?.role} no tiene privilegios operativos para gestionar usuarios.</p>
              <button onClick={() => navigate('dashboard')} className="mt-6 px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-dark shadow-sm">Volver al Resumen</button>
            </div>
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
