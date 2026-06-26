import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { Download } from "lucide-react";
import { HeatmapLayer, MapRefRegister, SelectedLocationMarker } from "./LeafletHelpers";
import { Modal } from "@/components/ui/Modal";

export function FullscreenMapModal({
  isOpen,
  onClose,
  mapCenter,
  mapZoom,
  heatmapPoints,
  selectedLocation,
  infractions = [],
  isExporting,
  handleExportReport,
  fullscreenMapContainerRef,
  fullscreenMapRef,
  canExport = true,
}) {
  if (!isOpen) return null;

  const renderHeaderExtra = canExport && (
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
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Visualización Expandida - Zonas de Mayor Incidencia"
      maxWidth="max-w-5xl"
      maxHeight="max-h-[90vh]"
      closeOnBackdropClick={true}
      backdropClassName="bg-black/95"
      className="bg-slate-900 border border-slate-700 w-full h-full rounded-lg overflow-hidden"
      headerClassName="px-4 py-3 border-b border-slate-800 bg-slate-950 shrink-0"
      bodyClassName="p-0 flex-1 w-full relative"
      titleClassName="text-xs font-bold text-slate-200 uppercase tracking-wider"
      closeButtonClassName="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors w-8 h-8 border-0 bg-transparent flex items-center justify-center shrink-0"
      headerExtra={renderHeaderExtra}
    >
      <div 
        ref={fullscreenMapContainerRef}
        className="w-full h-full relative"
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
          <SelectedLocationMarker location={selectedLocation} />
        </MapContainer>
      </div>
    </Modal>
  );
}
