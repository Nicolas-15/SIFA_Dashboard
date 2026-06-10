import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { Card } from "@/components/ui/Card";
import "leaflet/dist/leaflet.css";
import { Maximize2, Download } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { HeatmapPDFTemplate } from "./HeatmapPDFTemplate";
import { HeatmapLayer, MapRefRegister, SelectedLocationMarker } from "./LeafletHelpers";
import { FullscreenMapModal } from "./FullscreenMapModal";
import { exportHeatmapReport } from "../utils/pdfExporter";
import { getInfractionsReportSummary } from "@/services/infractions.service";
import { SYSTEM_ROLES } from "@/constants/roles";

export function DashboardHeatmap({
  summaryData,
  loadingSummary,
  startDate,
  endDate,
  selectedLocation,
  className = ''
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [mapImage, setMapImage] = useState(null);

  // Coordenadas iniciales del mapa de El Quisco
  const [mapCenter, setMapCenter] = useState([-33.3904, -71.6910]);
  const [mapZoom, setMapZoom] = useState(14);
  const [scrollWheelZoomEnabled, setScrollWheelZoomEnabled] = useState(false);

  const mapContainerRef = useRef(null);
  const fullscreenMapContainerRef = useRef(null);
  const reportRef = useRef(null);

  const mainMapRef = useRef(null);
  const fullscreenMapRef = useRef(null);

  // Solo tomamos currentUser y showToast del contexto global.
  const { currentUser = {}, showToast } = useOutletContext() || {};

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
        if (mainMapRef.current) {
          mainMapRef.current.setView([avgLat, avgLng], mapZoom);
        }
      }
    }
  }, [summaryData, mapZoom]);

  // Manejar habilitación dinámica de zoom con rueda
  useEffect(() => {
    if (mainMapRef.current) {
      if (scrollWheelZoomEnabled) {
        mainMapRef.current.scrollWheelZoom.enable();
      } else {
        mainMapRef.current.scrollWheelZoom.disable();
      }
    }
  }, [scrollWheelZoomEnabled]);

  // Formatear los puntos del mapa de calor a partir de las coordenadas del día de hoy
  const heatmapPoints = (summaryData?.coordenadas || [])
    .map((coord) => [
      parseFloat(coord.latitud),
      parseFloat(coord.longitud),
      1, // Intensidad por defecto
    ]);

  // Abrir pantalla completa sincronizando el centro actual del mapa
  const handleOpenFullscreen = () => {
    if (mainMapRef.current) {
      const map = mainMapRef.current;
      const c = map.getCenter();
      setMapCenter([c.lat, c.lng]);
      setMapZoom(map.getZoom());
    }
    setIsFullscreen(true);
  };

  // Cerrar pantalla completa devolviendo las coordenadas modificadas al mapa principal
  const handleCloseFullscreen = () => {
    if (fullscreenMapRef.current && mainMapRef.current) {
      const fsMap = fullscreenMapRef.current;
      const mainMap = mainMapRef.current;
      const c = fsMap.getCenter();
      const z = fsMap.getZoom();

      setMapCenter([c.lat, c.lng]);
      setMapZoom(z);

      mainMap.setView(c, z);
    }
    setIsFullscreen(false);
  };

  // Se llama directamente al presionar "Exportar Reporte"
  const handleExportReport = async () => {
    const activeRef = isFullscreen ? fullscreenMapContainerRef : mapContainerRef;
    if (!activeRef.current) return;

    try {
      setIsExporting(true);

      // Esperar un momento breve para asegurar que la UI esté lista
      await new Promise((resolve) => setTimeout(resolve, 300));

      await exportHeatmapReport({
        activeElement: activeRef.current,
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

  return (
    <Card className={`h-[340px] md:h-[450px] flex flex-col ${className}`}>
      {/* Cabecera del mapa con botón para exportar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3 md:mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 mb-0.5">
            Zonas de Mayor Incidencia
          </h3>
          <p className="text-xs text-slate-500">
            Mapa de calor basado en infracciones con GPS
          </p>
        </div>

        {(currentUser?.role === SYSTEM_ROLES.ADMIN || currentUser?.role === SYSTEM_ROLES.SUPERVISOR) && (
          <button
            onClick={handleExportReport}
            disabled={isExporting || loadingSummary || heatmapPoints.length === 0}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl transition-all border border-slate-700 shadow-sm shrink-0"
          >
            {isExporting ? (
              <>
                <div className="w-3 h-3 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                <span>Generando...</span>
              </>
            ) : (
              <>
                <Download size={13} />
                <span>Exportar Reporte</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Contenedor del mapa de la tarjeta */}
      <div
        ref={mapContainerRef}
        className="flex-1 min-h-[200px] rounded-lg overflow-hidden relative z-0 cursor-pointer"
        onClick={() => setScrollWheelZoomEnabled(true)}
        onMouseLeave={() => setScrollWheelZoomEnabled(false)}
      >
        {!scrollWheelZoomEnabled && heatmapPoints.length > 0 && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full pointer-events-none z-[1000] shadow-sm tracking-wide transition-all duration-300">
            Click para activar zoom
          </div>
        )}
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="md:!h-full"
          style={{ height: "100%", width: "100%", zIndex: 0 }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
            crossOrigin="anonymous"
          />
          <HeatmapLayer data={heatmapPoints} />
          <MapRefRegister mapRef={mainMapRef} />
          <SelectedLocationMarker location={selectedLocation} />
        </MapContainer>

        {/* Botón flotante para modo pantalla completa */}
        <button
          data-html2canvas-ignore="true"
          onClick={handleOpenFullscreen}
          className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-white/90 hover:bg-white text-slate-700 p-1.5 rounded-lg shadow-md border border-slate-200 transition-colors z-[1000]"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Modal expandido (pantalla completa) */}
      <FullscreenMapModal
        isOpen={isFullscreen}
        onClose={handleCloseFullscreen}
        mapCenter={mapCenter}
        mapZoom={mapZoom}
        heatmapPoints={heatmapPoints}
        selectedLocation={selectedLocation}
        isExporting={isExporting}
        handleExportReport={handleExportReport}
        fullscreenMapContainerRef={fullscreenMapContainerRef}
        fullscreenMapRef={fullscreenMapRef}
        canExport={currentUser?.role === SYSTEM_ROLES.ADMIN || currentUser?.role === SYSTEM_ROLES.SUPERVISOR}
      />

      {/* Plantilla invisible del PDF (Renderizado Off-Screen) */}
      <HeatmapPDFTemplate
        reportRef={reportRef}
        mapImage={mapImage}
        summaryData={summaryData}
        currentUser={currentUser}
        dateRange={{ startDate, endDate }}
      />
    </Card>
  );
}
