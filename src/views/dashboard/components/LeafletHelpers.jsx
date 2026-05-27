import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

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
