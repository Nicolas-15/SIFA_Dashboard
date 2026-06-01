import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { DashboardStatsCards } from "./components/DashboardStatsCards";
import { DashboardHeatmap } from "./components/DashboardHeatMap";
import { DashboardRecentActivity } from "./components/DashboardRecentActivity";
import { DashboardFiscalizadoresMap } from "./components/DashboardFiscalizadoresMap";
import { useFiscalizadoresActivos } from "@/core/useFiscalizadoresActivos";
import { useDashboardStats } from "@/core/useDashboardStats";
import {
  getInfractions,
  getInfractionsReportSummary,
} from "@/services/infractions.service";
import { SYSTEM_ROLES } from "@/constants/roles";

export function DashboardView() {
  const { currentUser } = useOutletContext() || {};
  const { fiscalizadores } = useFiscalizadoresActivos();

  // Fecha de hoy por defecto para el Resumen Diario
  const today = new Date().toLocaleDateString("en-CA").slice(0, 10);

  // Inicializar leyendo de sessionStorage si existen filtros guardados de esta sesión
  const [startDate, setStartDate] = useState(() => {
    return sessionStorage.getItem("dashboard_startDate") || today;
  });
  const [endDate, setEndDate] = useState(() => {
    return sessionStorage.getItem("dashboard_endDate") || today;
  });

  // Guardar en sessionStorage cuando el usuario cambie los filtros
  useEffect(() => {
    sessionStorage.setItem("dashboard_startDate", startDate);
    sessionStorage.setItem("dashboard_endDate", endDate);
  }, [startDate, endDate]);

  // Estados locales para los datos del dashboard
  const [summaryData, setSummaryData] = useState(null);
  const [recentInfractions, setRecentInfractions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Cargar resumen estadístico (coordenadas, estados, etc.)
        const summary = await getInfractionsReportSummary({
          startDate,
          endDate,
        });
        // Cargar lista de actividad reciente (las primeras 5 infracciones de ese rango)
        const recent = await getInfractions({
          page: 0,
          size: 5,
          startDate,
          endDate,
        });

        if (active) {
          setSummaryData(summary);
          setRecentInfractions(recent.content || []);
        }
      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      active = false;
    };
  }, [startDate, endDate]);

  // Solo mostrar el mapa de fiscalizadores en la calle para roles operativos
  const isSupervisorOrAdmin =
    currentUser?.role === SYSTEM_ROLES.ADMIN ||
    currentUser?.role === SYSTEM_ROLES.SUPERVISOR;

  // Hook dedicado para las estadísticas del Dashboard (endpoint liviano /estadisticas)
  const { kpiStats, loading: statsLoading } = useDashboardStats(startDate, endDate);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      {/* Cabecera del Dashboard con Filtro de Fechas */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">
            Resumen Diario
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Vista general del Sistema de Inteligencia para Fiscalización
            Automática
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de Fecha Desde */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Desde
            </span>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-slate-700 text-xs font-semibold outline-none w-[110px]"
            />
          </div>

          {/* Selector de Fecha Hasta */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Hasta
            </span>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={today}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-slate-700 text-xs font-semibold outline-none w-[110px]"
            />
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas generales del día */}
      <DashboardStatsCards stats={kpiStats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <DashboardHeatmap
          summaryData={summaryData}
          loadingSummary={loading}
          startDate={startDate}
          endDate={endDate}
          className="lg:col-span-2"
        />
        <DashboardRecentActivity infractions={recentInfractions} />
      </div>

      {isSupervisorOrAdmin && (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          <DashboardFiscalizadoresMap fiscalizadores={fiscalizadores} />
        </div>
      )}
    </div>
  );
}
