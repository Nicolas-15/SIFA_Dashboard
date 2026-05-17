import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import { Card } from "@/components/ui/Card";
import "leaflet/dist/leaflet.css";

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

export function DashboardHeatmap({ infractions }) {
  // Viña del Mar/Concón [-33.0456, -71.6214]
  // El Quisco [-33.3913, -71.6961]
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
    <Card>
      {" "}
      {/* h-[400px] asegura una altura fija estricta */}
      <h3 className="text-base font-bold text-slate-800 mb-0.5">
        Zonas de Mayor Incidencia
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        Mapa de calor basado en infracciones con GPS
      </p>
      {/* Es CRÍTICO que este div tenga una altura explícita para que el mapa se dibuje */}
      <div className="w-full h-full pb-8 rounded-lg overflow-hidden relative z-0">
        <MapContainer
          center={center}
          zoom={14}
          style={{ height: "100%", width: "100%", zIndex: 0 }} // zIndex 0 previene que el mapa cubra tus menús superpuestos
        >
          {/* El mapa base gratuito de OpenStreetMap */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          />
          <HeatmapLayer data={heatmapPoints} />
        </MapContainer>
      </div>
    </Card>
  );
}
