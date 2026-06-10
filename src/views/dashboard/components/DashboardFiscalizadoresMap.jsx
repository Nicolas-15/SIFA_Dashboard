import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Card } from "@/components/ui/Card";
import "leaflet/dist/leaflet.css";
import { X, Maximize2, User, Mail, Clock, Smartphone, Bell } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Modal } from "@/components/ui/Modal";
import { PushNotificationModal } from "@/components/ui/PushNotificationModal";
import { sendPushToEmail } from "@/utils/pushNotifications";

// Crear ícono SVG desde lucide User
const createFiscalizadorIcon = () => {
  const userSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

  const html = `
    <div style="
      background-color: #3b82f6;
      width: 40px;
      height: 40px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      border: 3px solid white;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    " onmouseover="this.style.transform='rotate(-45deg) scale(1.1)'; this.style.boxShadow='0 6px 16px rgba(59, 130, 246, 0.5)';" 
      onmouseout="this.style.transform='rotate(-45deg) scale(1)'; this.style.boxShadow='0 4px 12px rgba(59, 130, 246, 0.4)';">
      <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
        ${userSvg}
      </div>
    </div>
  `;

  return L.divIcon({
    className: "custom-fiscalizador-marker",
    html: html,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// Formatear fecha de manera legible
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });
  } catch (error) {
    return dateString;
  }
};

// Componente para actualizar el centro del mapa cuando hay marcadores
function FitBounds({ data }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !data || data.length === 0) return;

    const validPoints = data.filter(
      (f) => f.latitud !== undefined && f.longitud !== undefined,
    );

    if (validPoints.length === 0) return;

    const bounds = validPoints.map((f) => [f.latitud, f.longitud]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [map, data]);

  return null;
}

function FiscalizadorPopup({ fiscalizador, onNotify }) {
  const formattedDate = useMemo(
    () => formatDate(fiscalizador.ultimaConexion),
    [fiscalizador.ultimaConexion],
  );

  const deviceName = [fiscalizador.marcaDispositivo, fiscalizador.modeloDispositivo]
    .filter(Boolean)
    .join(" / ");

  return (
    <div className="w-64 p-3 bg-white rounded-xl shadow-lg ring-1 ring-slate-900/5">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 p-1.5 rounded-md">
            <User size={14} className="text-blue-600" />
          </div>
          <span className="font-semibold text-slate-800 text-sm tracking-tight">
            Fiscalizador
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-full ring-1 ring-green-500/20">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-[9px] text-green-700 font-bold uppercase tracking-wider">
            Activo
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <Mail size={14} className="text-slate-400 shrink-0" />
          <span
            className="text-xs text-slate-600 font-medium truncate"
            title={fiscalizador.email}
          >
            {fiscalizador.email}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <Clock size={14} className="text-slate-400 shrink-0" />
          <span className="text-xs text-slate-600 truncate">
            {formattedDate}
          </span>
        </div>

        {deviceName && (
          <div className="flex items-center gap-2.5">
            <Smartphone size={14} className="text-slate-400 shrink-0" />
            <span className="text-xs text-slate-600 font-medium truncate">
              {deviceName}
            </span>
          </div>
        )}

        {onNotify && fiscalizador.deviceId && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNotify(fiscalizador);
            }}
            className="mt-1.5 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs rounded-lg transition-colors"
          >
            <Bell size={13} />
            Enviar notificación
          </button>
        )}
      </div>
    </div>
  );
}

// Componente interno para obtener la referencia del mapa
function MapRefRegister({ mapRef }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    mapRef.current = map;
    return () => {
      mapRef.current = null;
    };
  }, [map, mapRef]);
  return null;
}

export function DashboardFiscalizadoresMap({ fiscalizadores, className = "" }) {
  const { showToast } = useOutletContext() || {};
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scrollWheelZoomEnabled, setScrollWheelZoomEnabled] = useState(false);
  const [notifyTarget, setNotifyTarget] = useState(null);
  const mapRef = useRef(null);

  const handleNotifySend = useCallback(async (title, body) => {
    const email = notifyTarget?.email;
    if (!email) throw new Error("Destino no especificado");

    try {
      await sendPushToEmail(email, title, body);
      showToast?.(`Notificación enviada a ${email}`, "success");
    } catch (err) {
      if (err.message === "DEVICE_NOT_FOUND") {
        showToast?.("El dispositivo de este fiscalizador no está registrado para notificaciones.", "error");
      } else {
        showToast?.("Error al enviar notificación", "error");
      }
      throw err;
    }
  }, [notifyTarget, showToast]);

  const center = [-33.0456, -71.6214]; // Centro por defecto (Valparaíso/Viña del Mar)
  const height = "500px"; // Altura  del mapa

  // Habilitar/Deshabilitar dinámicamente el scrollWheelZoom en Leaflet
  useEffect(() => {
    if (mapRef.current) {
      if (scrollWheelZoomEnabled) {
        mapRef.current.scrollWheelZoom.enable();
      } else {
        mapRef.current.scrollWheelZoom.disable();
      }
    }
  }, [scrollWheelZoomEnabled]);

  // Filtrar fiscalizadores con coordenadas válidas
  const fiscalizadoresConUbicacion =
    fiscalizadores?.filter(
      (f) => f.latitud !== undefined && f.longitud !== undefined,
    ) || [];

  const totalActivos = fiscalizadoresConUbicacion.length;

  return (
    <Card className={`${className}`}>
      <div className="mb-2 md:mb-3">
        <h3 className="text-base font-bold text-slate-800">
          Fiscalizadores en Terreno
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {totalActivos}{" "}
          {totalActivos === 1
            ? "fiscalizador activo"
            : "fiscalizadores activos"}
        </p>
      </div>

      <div 
        style={{ height, position: "relative", zIndex: 0 }}
        className="cursor-pointer"
        onClick={() => setScrollWheelZoomEnabled(true)}
        onMouseLeave={() => setScrollWheelZoomEnabled(false)}
      >
        {!scrollWheelZoomEnabled && totalActivos > 0 && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full pointer-events-none z-[1000] shadow-sm tracking-wide transition-all duration-300">
            Click para activar zoom
          </div>
        )}
        <MapContainer
          center={center}
          zoom={14}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
          className="rounded-lg"
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Ajustar vista para incluir todos los marcadores */}
          <FitBounds data={fiscalizadoresConUbicacion} />
          <MapRefRegister mapRef={mapRef} />

          {/* Renderizar marcadores */}
          {fiscalizadoresConUbicacion.map((fiscalizador, index) => (
            <Marker
              key={`${fiscalizador.email}-${index}`}
              position={[fiscalizador.latitud, fiscalizador.longitud]}
              icon={createFiscalizadorIcon()}
            >
              <Popup>
                <FiscalizadorPopup
                  fiscalizador={fiscalizador}
                  onNotify={setNotifyTarget}
                />
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Botón de pantalla completa */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-white/90 hover:bg-white text-slate-700 p-1.5 rounded-lg shadow-md border border-slate-200 transition-colors z-[1000]"
        >
          <Maximize2 size={16} />
        </button>

        {/* Mensaje cuando no hay fiscalizadores */}
        {fiscalizadoresConUbicacion.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-[100]">
            <div className="text-center p-4">
              <p className="text-slate-500 text-sm">
                No hay fiscalizadores activos en este momento
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal pantalla completa */}
      <Modal
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        title="Visualización Expandida - Fiscalizadores en Terreno"
        maxWidth="max-w-5xl"
        maxHeight="max-h-[90vh]"
        closeOnBackdropClick={true}
        backdropClassName="bg-black/95"
        className="bg-slate-900 border border-slate-700 w-full h-full rounded-lg overflow-hidden"
        headerClassName="px-4 py-3 border-b border-slate-800 bg-slate-950 shrink-0"
        bodyClassName="p-0 flex-1 w-full relative"
        titleClassName="text-xs font-bold text-slate-200 uppercase tracking-wider"
        closeButtonClassName="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors w-8 h-8 border-0 bg-transparent flex items-center justify-center shrink-0"
      >
        <MapContainer
          center={center}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <FitBounds data={fiscalizadoresConUbicacion} />
          {fiscalizadoresConUbicacion.map((fiscalizador, index) => (
            <Marker
              key={`${fiscalizador.email}-${index}`}
              position={[fiscalizador.latitud, fiscalizador.longitud]}
              icon={createFiscalizadorIcon()}
            >
              <Popup>
                <FiscalizadorPopup
                  fiscalizador={fiscalizador}
                  onNotify={setNotifyTarget}
                />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Modal>

      <PushNotificationModal
        isOpen={!!notifyTarget}
        onClose={() => setNotifyTarget(null)}
        email={notifyTarget?.email}
        onSend={handleNotifySend}
      />
    </Card>
  );
}
