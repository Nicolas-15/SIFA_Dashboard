import { useState, useCallback, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Search, Menu, Shield } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { Toast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/core/AuthContext";
import { useInfractions } from "@/core/useInfractions";

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [headerSearch, setHeaderSearch] = useState("");

  const { currentUser, logout } = useAuth();
  const {
    infractions,
    stats,
    loading,
    error,
    fetchInfractions,
    updateStatus,
    saveInfractionEdit,
    page, totalPages, totalElements, size, first, last,
    goToPage, nextPage, prevPage,
    dateRange, setDateRange, userFilter, setUserFilter, 
    activeFilter, setActiveFilter, searchQuery, setSearchQuery,
    clearFilters, setSize,
  } = useInfractions();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleForbidden = () => {
      navigate("/access-denied");
    };
    window.addEventListener("auth:forbidden", handleForbidden);
    return () => window.removeEventListener("auth:forbidden", handleForbidden);
  }, [navigate]);

  const showToast = useCallback(
    (message, type = "success") => setToast({ message, type, key: Date.now() }),
    [],
  );

  const pendingCount = stats?.cantidadPorEstado?.pending ?? 0;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const todayLabel = new Date().toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const todayCapitalized =
    todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);

  if (loading && infractions.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-slate-500 font-medium">
            Cargando infracciones...
          </p>
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
      <div
        className={`
        fixed md:relative inset-y-0 left-0 z-40
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
      `}
      >
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
            <p className="text-xs text-slate-500 font-medium leading-tight">
              {todayCapitalized}
            </p>
          </div>
        </header>

        {/* Renderizado de Vistas Hijas */}
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Outlet
            context={{
              infractions,
              stats,
              loading,
              error,
              updateStatus,
              saveInfractionEdit,
              showToast,
              headerSearch,
              onClearHeaderSearch: () => setHeaderSearch(""),
              fetchInfractions,
              currentUser,
              page, totalPages, totalElements, size, first, last,
              goToPage, nextPage, prevPage,
              dateRange, setDateRange, userFilter, setUserFilter, 
              activeFilter, setActiveFilter, searchQuery, setSearchQuery,
              clearFilters, setSize,
            }}
          />
        </div>

        <Footer />
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
