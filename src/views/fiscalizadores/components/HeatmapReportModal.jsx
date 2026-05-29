import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { X, Download, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import {
  HeatmapLayer,
  MapRefRegister,
} from "@/views/dashboard/components/LeafletHelpers";
import { HeatmapPDFTemplate } from "@/views/dashboard/components/HeatmapPDFTemplate";
import { exportHeatmapReport } from "@/views/dashboard/utils/pdfExporter";
import { getInfractionsReportSummary } from "@/services/infractions.service";
import { useOutletContext } from "react-router-dom";

export function HeatmapReportModal({ isOpen, onClose, startDate, endDate }) {
  const { currentUser = {}, showToast } = useOutletContext() || {};
  const [mapCenter, setMapCenter] = useState([-33.3904, -71.691]);
  const [mapZoom, setMapZoom] = useState(14);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [mapImage, setMapImage] = useState(null);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const reportRef = useRef(null);

  // Cargar datos de infracciones cuando se abra el modal
  useEffect(() => {
    if (isOpen && startDate && endDate) {
      const fetchSummaryData = async () => {
        setLoading(true);
        try {
          const data = await getInfractionsReportSummary({
            startDate,
            endDate,
          });
          setSummaryData(data);
        } catch (err) {
          console.error("Error al cargar datos del heatmap:", err);
          if (showToast) {
            showToast("Error al cargar datos del mapa de calor", "error");
          }
        } finally {
          setLoading(false);
        }
      };
      fetchSummaryData();
    }
  }, [isOpen, startDate, endDate, showToast]);

  // Formatear los puntos del mapa de calor
  const heatmapPoints = (summaryData?.coordenadas || []).map((coord) => [
    parseFloat(coord.latitud),
    parseFloat(coord.longitud),
    1,
  ]);

  // Manejar exportación del reporte
  const handleExportReport = async () => {
    if (!mapContainerRef.current || !reportRef.current) return;

    try {
      setIsExporting(true);
      await new Promise((resolve) => setTimeout(resolve, 300));

      await exportHeatmapReport({
        activeElement: mapContainerRef.current,
        reportElement: reportRef.current,
        setMapImage,
        showToast,
      });
    } catch (err) {
      console.error("Error al exportar reporte:", err);
      if (showToast) {
        showToast("Error al generar el reporte en PDF", "error");
      }
    } finally {
      setIsExporting(false);
      setMapImage(null);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 h-[80vh] flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Mapa de Calor - Zonas de Mayor Incidencia
            </h3>
            <p className="text-xs text-slate-500">
              {startDate && endDate
                ? `Período: ${startDate} al ${endDate}`
                : "Seleccione un rango de fechas válido"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportReport}
              disabled={
                isExporting ||
                loading ||
                !summaryData ||
                heatmapPoints.length === 0
              }
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl transition-all border border-primary/20 shadow-sm shrink-0"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <Download size={13} />
                  <span>Exportar PDF</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content - Mapa */}
        <div className="flex-1 p-4 min-h-0">
          <div
            ref={mapContainerRef}
            className="w-full h-full rounded-lg overflow-hidden relative z-0"
          >
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-[1000]">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-slate-600 font-medium">
                    Cargando mapa de calor...
                  </p>
                </div>
              </div>
            ) : heatmapPoints.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-[1000]">
                <div className="text-center">
                  <p className="text-sm text-slate-600 font-medium mb-1">
                    No hay datos de infracciones
                  </p>
                  <p className="text-xs text-slate-400">
                    No se encontraron infracciones con GPS en este período
                  </p>
                </div>
              </div>
            ) : (
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                className="!h-full"
                style={{ height: "100%", width: "100%", zIndex: 0 }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                  crossOrigin="anonymous"
                />
                <HeatmapLayer data={heatmapPoints} />
                <MapRefRegister mapRef={mapRef} />
              </MapContainer>
            )}
          </div>
        </div>

        {/* Plantilla invisible del PDF */}
        <HeatmapPDFTemplate
          reportRef={reportRef}
          mapImage={mapImage}
          summaryData={summaryData}
          currentUser={currentUser}
          dateRange={{ startDate, endDate }}
        />
      </div>
    </div>
  );
}
