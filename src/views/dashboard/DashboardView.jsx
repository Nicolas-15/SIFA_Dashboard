import { useOutletContext } from "react-router-dom";
import { DashboardStatsCards } from "./components/DashboardStatsCards";
import { DashboardHeatmap } from "./components/DashboardHeatMap";
import { DashboardRecentActivity } from "./components/DashboardRecentActivity";
import { DashboardFiscalizadoresMap } from "./components/DashboardFiscalizadoresMap";
import { useFiscalizadoresActivos } from "@/core/useFiscalizadoresActivos";
import { SYSTEM_ROLES } from "@/constants/roles";

export function DashboardView() {
  const { infractions, currentUser } = useOutletContext();
  const { fiscalizadores, loading } = useFiscalizadoresActivos();

  // Solo mostrar el mapa de fiscalizadores en la calle para roles operativos
  const isSupervisorOrAdmin = 
    currentUser?.role === SYSTEM_ROLES.ADMIN || 
    currentUser?.role === SYSTEM_ROLES.SUPERVISOR;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">
          Resumen Diario
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Vista general del Sistema de Inteligencia para Fiscalización
          Automática
        </p>
      </div>

      <DashboardStatsCards infractions={infractions} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <DashboardHeatmap infractions={infractions} className="lg:col-span-2" />
        <DashboardRecentActivity infractions={infractions} />
      </div>

      {isSupervisorOrAdmin && (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          <DashboardFiscalizadoresMap fiscalizadores={fiscalizadores} />
        </div>
      )}
    </div>
  );
}
