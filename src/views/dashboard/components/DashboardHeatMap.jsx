import { useState, useRef } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { Card } from "@/components/ui/Card";
import "leaflet/dist/leaflet.css";
import { Maximize2, Download } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { HeatmapPDFTemplate } from "./HeatmapPDFTemplate";
import { HeatmapLayer, MapRefRegister } from "./LeafletHelpers";
import { FullscreenMapModal } from "./FullscreenMapModal";
import { exportHeatmapReport } from "../utils/pdfExporter";

export function DashboardHeatmap({ infractions, className = '' }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [mapImage, setMapImage] = useState(null);
  
  // Coordenadas iniciales del mapa de El Quisco / Valparaíso
  const [mapCenter, setMapCenter] = useState([-33.0456, -71.6214]);
  const [mapZoom, setMapZoom] = useState(14);
  
  const mapContainerRef = useRef(null);
  const fullscreenMapContainerRef = useRef(null);
  const reportRef = useRef(null);
  
  const mainMapRef = useRef(null);
  const fullscreenMapRef = useRef(null);

  const { currentUser = {}, dateRange = {}, showToast } = useOutletContext() || {};

  // Formatear los puntos del mapa de calor a partir de las coordenadas de las infracciones
  const heatmapPoints = infractions
    .filter((inf) => inf.location && inf.location.lat && inf.location.lng)
    .map((inf) => [
      parseFloat(inf.location.lat),
      parseFloat(inf.location.lng),
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

  // Delegar la generación del reporte PDF al utilitario pdfExporter
  const handleExportReport = async () => {
    const activeRef = isFullscreen ? fullscreenMapContainerRef : mapContainerRef;
    if (!activeRef.current) return;
    
    try {
      setIsExporting(true);
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
    <Card className={`h-[340px] md:h-auto flex flex-col ${className}`}>
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
        <button
          onClick={handleExportReport}
          disabled={isExporting || infractions.length === 0}
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
      </div>

      {/* Contenedor del mapa de la tarjeta */}
      <div 
        ref={mapContainerRef}
        className="flex-1 min-h-[200px] rounded-lg overflow-hidden relative z-0"
      >
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="md:!h-full"
          style={{ height: "100%", width: "100%", zIndex: 0 }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
            crossOrigin="anonymous"
          />
          <HeatmapLayer data={heatmapPoints} />
          <MapRefRegister mapRef={mainMapRef} />
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
        infractions={infractions}
        isExporting={isExporting}
        handleExportReport={handleExportReport}
        fullscreenMapContainerRef={fullscreenMapContainerRef}
        fullscreenMapRef={fullscreenMapRef}
      />

      {/* Plantilla invisible del PDF (Renderizado Off-Screen) */}
      <HeatmapPDFTemplate
        reportRef={reportRef}
        mapImage={mapImage}
        infractions={infractions}
        currentUser={currentUser}
        dateRange={dateRange}
      />
    </Card>
  );
}
