import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { Calendar } from "lucide-react";
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
import { getTodayLocalDateString } from "@/utils/date";

function formatDateInput(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function toApiDate(display) {
  if (!display || display.length !== 10) return '';
  const [dd, mm, yyyy] = display.split('/');
  if (!dd || !mm || !yyyy) return '';
  return `${yyyy}-${mm}-${dd}`;
}

function fromApiDate(api) {
  if (!api) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(api)) return api;
  const parts = api.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return api;
}

export function DashboardView() {
  const { currentUser } = useOutletContext() || {};
  const { fiscalizadores } = useFiscalizadoresActivos();

  // Fecha de hoy por defecto para el Resumen Diario
  const today = getTodayLocalDateString();

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

  const startPickerRef = useRef(null);
  const endPickerRef = useRef(null);

  const [localStartDate, setLocalStartDate] = useState(fromApiDate(startDate));
  const [localEndDate, setLocalEndDate] = useState(fromApiDate(endDate));

  const openStartPicker = () => startPickerRef.current?.showPicker();
  const openEndPicker = () => endPickerRef.current?.showPicker();

  const handleStartDateChange = (e) => {
    const raw = e.target.value;
    const formatted = formatDateInput(raw);
    setLocalStartDate(formatted);
    const apiDate = toApiDate(formatted);
    if (apiDate) setStartDate(apiDate);
  };

  const handleEndDateChange = (e) => {
    const raw = e.target.value;
    const formatted = formatDateInput(raw);
    setLocalEndDate(formatted);
    const apiDate = toApiDate(formatted);
    if (apiDate) setEndDate(apiDate);
  };

  const handleStartNativeDateChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    const [yyyy, mm, dd] = val.split('-');
    const formatted = `${dd}/${mm}/${yyyy}`;
    setLocalStartDate(formatted);
    setStartDate(val);
  };

  const handleEndNativeDateChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    const [yyyy, mm, dd] = val.split('-');
    const formatted = `${dd}/${mm}/${yyyy}`;
    setLocalEndDate(formatted);
    setEndDate(val);
  };

  // Estados locales para los datos del dashboard
  const [summaryData, setSummaryData] = useState(null);
  const [recentInfractions, setRecentInfractions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInfractionLocation, setSelectedInfractionLocation] = useState(null);

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

        <div className="flex flex-wrap items-center gap-3 mr-4">
          {/* Selector de Fecha Desde */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Desde
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="dd/mm/aaaa"
              value={localStartDate}
              onChange={handleStartDateChange}
              onClick={openStartPicker}
              className="bg-transparent text-slate-700 text-xs font-semibold outline-none w-[85px] cursor-pointer"
            />
            <button
              type="button"
              onClick={openStartPicker}
              className="p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              tabIndex={-1}
              title="Abrir calendario"
            >
              <Calendar size={14} />
            </button>
            <input
              ref={startPickerRef}
              type="date"
              value={startDate}
              max={endDate}
              onChange={handleStartNativeDateChange}
              className="sr-only"
            />
          </div>

          {/* Selector de Fecha Hasta */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Hasta
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="dd/mm/aaaa"
              value={localEndDate}
              onChange={handleEndDateChange}
              onClick={openEndPicker}
              className="bg-transparent text-slate-700 text-xs font-semibold outline-none w-[85px] cursor-pointer"
            />
            <button
              type="button"
              onClick={openEndPicker}
              className="p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              tabIndex={-1}
              title="Abrir calendario"
            >
              <Calendar size={14} />
            </button>
            <input
              ref={endPickerRef}
              type="date"
              value={endDate}
              min={startDate}
              max={today}
              onChange={handleEndNativeDateChange}
              className="sr-only"
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
          selectedLocation={selectedInfractionLocation}
          className="lg:col-span-2"
        />
        <DashboardRecentActivity
          infractions={recentInfractions}
          selectedInfractionId={selectedInfractionLocation?.id}
          onSelectInfraction={({ id, lat, lng, plate, fiscalizador, tipoNombre }) => {
            const sameAsSelected = selectedInfractionLocation?.id === id;
            setSelectedInfractionLocation(
              sameAsSelected ? null : { id, lat, lng, plate, fiscalizador, tipoNombre },
            );
          }}
        />
      </div>

      {isSupervisorOrAdmin && (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          <DashboardFiscalizadoresMap fiscalizadores={fiscalizadores} />
        </div>
      )}
    </div>
  );
}
