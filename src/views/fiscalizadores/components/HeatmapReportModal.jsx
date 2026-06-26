import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { Download, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import {
  HeatmapLayer,
  MapRefRegister,
} from "@/views/dashboard/components/LeafletHelpers";
import { HeatmapPDFTemplate } from "@/views/dashboard/components/HeatmapPDFTemplate";
import { exportHeatmapReport } from "@/views/dashboard/utils/pdfExporter";
import { getInfractionsReportSummary } from "@/services/infractions.service";
import { useOutletContext } from "react-router-dom";
import { Modal } from "@/components/ui/Modal";

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

  // Centrar el mapa automáticamente en base al promedio de coordenadas
  useEffect(() => {
    if (summaryData?.coordenadas && summaryData.coordenadas.length > 0) {
      const validCoords = summaryData.coordenadas.filter(
        (c) => c.latitud && c.longitud && !isNaN(parseFloat(c.latitud)) && !isNaN(parseFloat(c.longitud))
      );
      if (validCoords.length > 0) {
        const sumLat = validCoords.reduce((sum, c) => sum + parseFloat(c.latitud), 0);
        const sumLng = validCoords.reduce((sum, c) => sum + parseFloat(c.longitud), 0);
        const avgLat = sumLat / validCoords.length;
        const avgLng = sumLng / validCoords.length;
        setMapCenter([avgLat, avgLng]);
        if (mapRef.current) {
          mapRef.current.setView([avgLat, avgLng], mapZoom);
        }
      }
    }
  }, [summaryData, mapZoom]);

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

  const renderHeaderExtra = (
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
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mapa de Calor - Zonas de Mayor Incidencia"
      description={
        startDate && endDate
          ? `Período: ${startDate} al ${endDate}`
          : "Seleccione un rango de fechas válido"
      }
      maxWidth="max-w-4xl"
      maxHeight="h-[80vh]"
      closeOnBackdropClick={true}
      className="mx-4 rounded-2xl"
      headerClassName="p-4 border-b border-slate-200"
      bodyClassName="p-4 min-h-0 flex flex-col"
      titleClassName="text-lg font-bold text-slate-800"
      descriptionClassName="text-xs text-slate-500 mt-0.5"
      closeButtonClassName="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors w-9 h-9 border-0 bg-transparent flex items-center justify-center"
      headerExtra={renderHeaderExtra}
    >
      <div
        ref={mapContainerRef}
        className="w-full h-full rounded-lg overflow-hidden relative z-0 flex-1 min-h-0"
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

      {/* Plantilla invisible del PDF */}
      <HeatmapPDFTemplate
        reportRef={reportRef}
        mapImage={mapImage}
        summaryData={summaryData}
        currentUser={currentUser}
        dateRange={{ startDate, endDate }}
      />
    </Modal>
  );
}
