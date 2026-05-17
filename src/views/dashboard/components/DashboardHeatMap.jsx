import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import { Card } from "@/components/ui/Card";
import "leaflet/dist/leaflet.css";
import { X, Maximize2 } from "lucide-react";

// Un componente interno para inyectar el plugin de calor
function HeatmapLayer({ data }) {
  const map = useMap();

  useEffect(() => {
    if (!map || data.length === 0) return;

    // L.heatLayer viene del plugin leaflet.heat
    const heatLayer = L.heatLayer(data, {
      radius: 25, // Qué tan grandes son los "puntos"
      blur: 15, // Qué tan difuminados están los bordes
      maxZoom: 17, // A partir de qué nivel de zoom los puntos ya no escalan
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, data]);

  return null;
}

export function DashboardHeatmap({ infractions, className = '' }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const center = [-33.0456, -71.6214];

  // 1. Aquí está la corrección clave: buscar dentro de inf.location
  const heatmapPoints = infractions
    .filter((inf) => inf.location && inf.location.lat && inf.location.lng)
    .map((inf) => [
      parseFloat(inf.location.lat),
      parseFloat(inf.location.lng),
      1, // Intensidad del punto
    ]);

  return (
    <Card className={`h-[340px] md:h-auto flex flex-col ${className}`}>
      <h3 className="text-base font-bold text-slate-800 mb-0.5">
        Zonas de Mayor Incidencia
      </h3>
      <p className="text-xs text-slate-500 mb-3 md:mb-4">
        Mapa de calor basado en infracciones con GPS
      </p>
      <div className="flex-1 min-h-[200px] rounded-lg overflow-hidden relative z-0">
        <MapContainer
          center={center}
          zoom={14}
          className="md:!h-full"
          style={{ height: "100%", width: "100%", zIndex: 0 }} // zIndex 0 previene que el mapa cubra tus menús superpuestos
        >
          {/* El mapa base gratuito de OpenStreetMap */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          />
          <HeatmapLayer data={heatmapPoints} />
        </MapContainer>
        <button 
          onClick={() => setIsFullscreen(true)}
          className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-white/90 hover:bg-white text-slate-700 p-1.5 rounded-lg shadow-md border border-slate-200 transition-colors z-[1000]"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Modal pantalla completa */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <button 
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-50"
            onClick={() => setIsFullscreen(false)}
          >
            <X size={32} />
          </button>
          
          <div 
            className="w-full h-full max-w-5xl max-h-[90vh] rounded-lg overflow-hidden border border-slate-600"
            onClick={(e) => e.stopPropagation()}
          >
            <MapContainer
              center={center}
              zoom={14}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
              />
              <HeatmapLayer data={heatmapPoints} />
            </MapContainer>
          </div>
        </div>
      )}
    </Card>
  );
}
