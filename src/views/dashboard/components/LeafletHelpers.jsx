import { useEffect } from "react";
import { useMap, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import { MapPin, Car, User, Crosshair } from "lucide-react";

// Componente interno para inyectar la capa de calor de Leaflet
export function HeatmapLayer({ data }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Redibujar/recalcular tamaño del mapa para evitar cortes
    map.invalidateSize();

    if (data.length === 0) return;

    // L.heatLayer proviene del plugin importado leaflet.heat
    const heatLayer = L.heatLayer(data, {
      radius: 25,     // Radio de dispersión de los puntos de calor
      blur: 15,       // Difuminado de los bordes del mapa de calor
      maxZoom: 17,    // Zoom máximo a partir del cual el calor ya no escala
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, data]);

  return null;
}

// Componente para sincronizar y registrar las referencias del mapa de Leaflet
export function MapRefRegister({ mapRef }) {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    mapRef.current = map;
    
    // Invalidamos el tamaño del mapa inmediatamente para forzar a Leaflet a recalcular sus límites en layouts flexibles
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      mapRef.current = null;
      clearTimeout(timer);
    };
  }, [map, mapRef]);

  return null;
}

function createSelectedIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 32px; height: 32px;
      background: #ef4444;
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 16px rgba(239, 68, 68, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    "><div style="transform: rotate(45deg); width: 12px; height: 12px; background: white; border-radius: 50%;"></div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

export function SelectedLocationMarker({ location }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !location) return;
    map.setView([location.lat, location.lng], Math.max(map.getZoom() || 15, 15));
  }, [map, location]);

  if (!location) return null;
  return (
    <Marker position={[location.lat, location.lng]} icon={createSelectedIcon()}>
      <Popup>
        <div className="min-w-[180px] px-1 py-0.5 space-y-2">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
            <MapPin size={14} className="text-red-500 shrink-0" />
            <span className="text-xs font-bold text-slate-700 truncate max-w-[160px]" title={location.tipoNombre}>
              {location.tipoNombre || "Infracción"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Car size={11} className="text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-600 font-mono">
              {location.plate || "S/P"}
            </span>
          </div>
          {location.fiscalizador && (
            <div className="flex items-center gap-2">
              <User size={11} className="text-slate-400 shrink-0" />
              <span className="text-xs text-slate-500 truncate">
                {location.fiscalizador}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Crosshair size={11} className="text-slate-400 shrink-0" />
            <span className="text-[10px] text-slate-400 font-mono">
              {location.lat?.toFixed(5)}, {location.lng?.toFixed(5)}
            </span>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
