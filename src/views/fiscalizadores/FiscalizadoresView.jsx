import { useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { Search, FileText, RefreshCw } from "lucide-react";

import { useFiscalizadoresActivos } from "@/core/useFiscalizadoresActivos";
import { sendPushToEmail } from "@/utils/pushNotifications";
import { FiscalizadoresTable } from "./components/FiscalizadoresTable";
import { FiscalizadoresMobileCards } from "./components/FiscalizadoresMobileCards";
import { GenerateReportModal } from "./components/GenerateReportModal";
import { HeatmapReportModal } from "./components/HeatmapReportModal";
import { ProductividadReportModal } from "./components/ProductividadReportModal";
import { PushNotificationModal } from "@/components/ui/PushNotificationModal";
import { MapModal } from "@/components/ui/MapModal";
import { TableCard } from "@/components/ui/TableCard";
import { Spinner } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function FiscalizadoresView() {
  const { showToast } = useOutletContext();
  const {
    fiscalizadores,
    loading,
    error,
    page,
    totalPages,
    totalElements,
    first,
    last,
    goToPage,
    fetchFiscalizadoresActivos,
  } = useFiscalizadoresActivos();

  const [search, setSearch] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isHeatmapModalOpen, setIsHeatmapModalOpen] = useState(false);
  const [isProductividadModalOpen, setIsProductividadModalOpen] =
    useState(false);
  const [reportDateRange, setReportDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const [notifyTarget, setNotifyTarget] = useState(null);
  const [mapTarget, setMapTarget] = useState(null);

  const handleNotifySend = useCallback(async (title, body) => {
    if (!notifyTarget?.email) return;
    try {
      await sendPushToEmail(notifyTarget.email, title, body);
      showToast?.(`Notificación enviada a ${notifyTarget.email}`, "success");
    } catch (err) {
      if (err.message === "DEVICE_NOT_FOUND") {
        showToast?.("El dispositivo de este fiscalizador no está registrado para notificaciones.", "error");
      } else {
        showToast?.("Error al enviar notificación", "error");
      }
      throw err;
    }
  }, [notifyTarget, showToast]);

  const filtered = fiscalizadores.filter((f) =>
    f.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">
            Fiscalizadores en Terreno
          </h2>
          <p className="text-sm text-slate-500">
            Personal que ha reportado actividad en los últimos 10 minutos.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 sm:shrink-0">
            <Button
              variant="outline"
              onClick={() => fetchFiscalizadoresActivos()}
              disabled={loading}
              className="!px-3"
              title="Actualizar datos"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsReportModalOpen(true)}
              title="Generar reporte"
              className="px-4"
            >
              <FileText size={18} />
              <span>Reportes</span>
            </Button>
          </div>

          <div className="sm:flex-1 sm:min-w-0">
            <Input
              placeholder="Buscar por email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
              className="w-full !py-2"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          No se pudieron cargar los fiscalizadores activos.
        </div>
      )}

      <div className="relative flex-1 flex flex-col">
        {loading && fiscalizadores.length > 0 && (
          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
            <div className="flex flex-col items-center gap-3">
              <Spinner />
              <p className="text-sm font-semibold text-slate-500">Actualizando fiscalizadores...</p>
            </div>
          </div>
        )}

        {/* Desktop table */}
        <div className="hidden md:flex flex-1 flex-col">
          <TableCard
            totalElements={totalElements}
            totalPages={totalPages}
            page={page}
            first={first}
            last={last}
            loading={loading}
            onPageChange={goToPage}
          >
            <FiscalizadoresTable
              loading={loading}
              filtered={filtered}
              search={search}
              onNotify={setNotifyTarget}
              onShowMap={setMapTarget}
            />
          </TableCard>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden flex-1 overflow-auto space-y-3 pb-4">
          <FiscalizadoresMobileCards
            filtered={filtered}
            search={search}
            onNotify={setNotifyTarget}
            onShowMap={setMapTarget}
          />
        </div>

        {/* Mobile pagination */}
        <div className="md:hidden flex items-center justify-between px-2 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500 font-medium">
            {totalElements > 0
              ? `${totalElements} resultados${totalPages > 1 ? ` (pág. ${page + 1} de ${totalPages})` : ''}`
              : ''
            }
          </p>
          <Pagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            first={first}
            last={last}
            onPageChange={goToPage}
            loading={loading}
            noBorder
          />
        </div>
      </div>

      <PushNotificationModal
        isOpen={!!notifyTarget}
        onClose={() => setNotifyTarget(null)}
        email={notifyTarget?.email}
        onSend={handleNotifySend}
      />

      <MapModal
        isOpen={!!mapTarget}
        onClose={() => setMapTarget(null)}
        latitude={mapTarget?.latitud}
        longitude={mapTarget?.longitud}
        label={mapTarget?.email}
        title={`Ubicación de ${mapTarget?.email ?? ''}`}
      />

      {/* Modal para generar reportes */}
      <GenerateReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        fiscalizadores={fiscalizadores}
        onGenerateReport={({ startDate, endDate, reportType }) => {
          setReportDateRange({ startDate, endDate });
          setIsReportModalOpen(false);

          if (reportType === "ubicaciones") {
            setIsHeatmapModalOpen(true);
          } else if (reportType === "actividad") {
            setIsProductividadModalOpen(true);
          }
        }}
      />

      {/* Modal para reporte del mapa de calor */}
      <HeatmapReportModal
        isOpen={isHeatmapModalOpen}
        onClose={() => setIsHeatmapModalOpen(false)}
        startDate={reportDateRange.startDate}
        endDate={reportDateRange.endDate}
      />

      {/* Modal para reporte de productividad */}
      <ProductividadReportModal
        isOpen={isProductividadModalOpen}
        onClose={() => setIsProductividadModalOpen(false)}
        startDate={reportDateRange.startDate}
        endDate={reportDateRange.endDate}
      />
    </div>
  );
}
