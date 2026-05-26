import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { X, Download } from "lucide-react";
import { HeatmapLayer, MapRefRegister } from "./LeafletHelpers";

export function FullscreenMapModal({
  isOpen,
  onClose,
  mapCenter,
  mapZoom,
  heatmapPoints,
  infractions = [],
  isExporting,
  handleExportReport,
  fullscreenMapContainerRef,
  fullscreenMapRef,
  canExport = true,
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full h-full max-w-5xl max-h-[90vh] rounded-lg overflow-hidden border border-slate-700 flex flex-col bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado premium del modal expandido */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-800 bg-slate-950 shrink-0">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Visualización Expandida - Zonas de Mayor Incidencia
          </span>
          <div className="flex items-center gap-3">
            {/* Botón de exportación dentro del modal */}
            {canExport && (
              <button
                onClick={handleExportReport}
                disabled={isExporting || heatmapPoints.length === 0}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold text-xs rounded-xl transition-all border border-slate-700 shadow-sm shrink-0"
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
            
            {/* Botón para cerrar pantalla completa */}
            <button 
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              onClick={onClose}
              title="Cerrar pantalla completa"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Contenedor del mapa en pantalla completa */}
        <div 
          ref={fullscreenMapContainerRef}
          className="flex-1 w-full relative"
        >
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
              crossOrigin="anonymous"
            />
            <HeatmapLayer data={heatmapPoints} />
            <MapRefRegister mapRef={fullscreenMapRef} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
