import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Card } from "@/components/ui/Card";
import "leaflet/dist/leaflet.css";
import { Maximize2, User, Mail, Clock, Smartphone, Bell } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Modal } from "@/components/ui/Modal";
import { PushNotificationModal } from "@/components/ui/PushNotificationModal";
import { sendPushToEmail } from "@/utils/pushNotifications";

const createFiscalizadorIcon = (isSelected = false) => {
  const bgColor = isSelected ? "#f59e0b" : "#3b82f6";
  const shadowColor = isSelected
    ? "rgba(245, 158, 11, 0.5)"
    : "rgba(59, 130, 246, 0.4)";
  const size = isSelected ? 50 : 40;
  const iconSize = isSelected ? 24 : 20;

  const userSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

  const html = `
    <div style="
      background-color: ${bgColor};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px ${shadowColor};
      border: 3px solid white;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    " onmouseover="this.style.transform='rotate(-45deg) scale(1.1)'; this.style.boxShadow='0 6px 16px ${shadowColor}';" 
      onmouseout="this.style.transform='rotate(-45deg) scale(1)'; this.style.boxShadow='0 4px 12px ${shadowColor}';">
      <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
        ${userSvg}
      </div>
    </div>
  `;

  return L.divIcon({
    className: `custom-fiscalizador-marker${isSelected ? " selected" : ""}`,
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

const iconCache = {};
const getFiscalizadorIcon = (isSelected) => {
  const key = isSelected ? "selected" : "default";
  if (!iconCache[key]) {
    iconCache[key] = createFiscalizadorIcon(isSelected);
  }
  return iconCache[key];
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

// Componente para ajustar el mapa SOLO al montar (evita zoom-out en re-renders)
function FitBounds({ data }) {
  const map = useMap();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!map || !data || data.length === 0) return;
    if (hasRun.current) return;
    hasRun.current = true;

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

        {onNotify && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNotify(fiscalizador);
            }}
            disabled={!fiscalizador.deviceRegistered}
            className={`mt-1.5 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
              fiscalizador.deviceRegistered
                ? "bg-primary/10 hover:bg-primary/20 text-primary"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
            title={fiscalizador.deviceRegistered ? "Enviar notificación push" : "Sin dispositivo registrado para notificaciones"}
          >
            <Bell size={13} />
            {fiscalizador.deviceRegistered ? "Enviar notificación" : "Sin registro"}
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

function MapContent({ fiscalizadores, selectedFiscalizadorEmail, onNotify, onSelectFiscalizador }) {
  return (
    <>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <FitBounds data={fiscalizadores} />
      {fiscalizadores.map((fiscalizador) => {
        const isSelected = selectedFiscalizadorEmail === fiscalizador.email;
        return (
          <Marker
            key={fiscalizador.email}
            position={[fiscalizador.latitud, fiscalizador.longitud]}
            icon={getFiscalizadorIcon(isSelected)}
            zIndexOffset={isSelected ? 1000 : 0}
            eventHandlers={{
              click: () => onSelectFiscalizador?.(fiscalizador),
            }}
          >
            <Popup>
              <FiscalizadorPopup
                fiscalizador={fiscalizador}
                onNotify={onNotify}
              />
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

function FlyToSelected({ selectedFiscalizador, allFiscalizadores }) {
  const map = useMap();
  const prevSelected = useRef(selectedFiscalizador);

  useEffect(() => {
    if (!map) return;

    const wasSelected = prevSelected.current;
    prevSelected.current = selectedFiscalizador;

    if (selectedFiscalizador?.latitud && selectedFiscalizador?.longitud) {
      map.flyTo(
        [selectedFiscalizador.latitud, selectedFiscalizador.longitud],
        16,
        { duration: 1 },
      );
      return;
    }

    if (wasSelected && !selectedFiscalizador && allFiscalizadores?.length > 0) {
      const bounds = allFiscalizadores.map((f) => [f.latitud, f.longitud]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [map, selectedFiscalizador, allFiscalizadores]);

  return null;
}

export function DashboardFiscalizadoresMap({
  fiscalizadores,
  selectedFiscalizadorEmail,
  onSelectFiscalizador,
  className = "",
}) {
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

  const center = [-33.0456, -71.6214];
  const height = "500px";

  useEffect(() => {
    if (mapRef.current) {
      if (scrollWheelZoomEnabled) {
        mapRef.current.scrollWheelZoom.enable();
      } else {
        mapRef.current.scrollWheelZoom.disable();
      }
    }
  }, [scrollWheelZoomEnabled]);

  const fiscalizadoresConUbicacion =
    fiscalizadores?.filter(
      (f) => f.latitud !== undefined && f.longitud !== undefined,
    ) || [];

  const selectedFiscalizador = selectedFiscalizadorEmail
    ? fiscalizadoresConUbicacion.find((f) => f.email === selectedFiscalizadorEmail)
    : null;

  return (
    <Card className={className}>
      <div
        style={{ height, position: "relative", zIndex: 0 }}
        className="cursor-pointer"
        onClick={() => setScrollWheelZoomEnabled(true)}
        onMouseLeave={() => setScrollWheelZoomEnabled(false)}
      >
        {!scrollWheelZoomEnabled && fiscalizadoresConUbicacion.length > 0 && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full pointer-events-none z-[1000] shadow-sm tracking-wide">
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
          <MapRefRegister mapRef={mapRef} />
          <MapContent
            fiscalizadores={fiscalizadoresConUbicacion}
            selectedFiscalizadorEmail={selectedFiscalizadorEmail}
            onNotify={setNotifyTarget}
            onSelectFiscalizador={onSelectFiscalizador}
          />
          <FlyToSelected
            selectedFiscalizador={selectedFiscalizador}
            allFiscalizadores={fiscalizadoresConUbicacion}
          />
        </MapContainer>

        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-white/90 hover:bg-white text-slate-700 p-1.5 rounded-lg shadow-md border border-slate-200 transition-colors z-[1000]"
        >
          <Maximize2 size={16} />
        </button>

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
        <div className="absolute top-2 left-2 right-2 z-[1000] flex gap-1.5 overflow-x-auto pb-1 pointer-events-none">
          {fiscalizadoresConUbicacion.map((f) => {
            const isSelected = selectedFiscalizadorEmail === f.email;
            const deviceName = [f.marcaDispositivo, f.modeloDispositivo].filter(Boolean).join(" / ");
            return (
              <button
                key={f.email}
                onClick={() => onSelectFiscalizador?.(f)}
                className={`pointer-events-auto shrink-0 flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  isSelected
                    ? "bg-amber-500/90 text-white shadow-lg ring-1 ring-amber-300"
                    : "bg-slate-900/80 backdrop-blur-sm text-slate-200 hover:bg-slate-800/90 ring-1 ring-white/10"
                }`}
              >
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full shrink-0" />
                <span className="font-medium whitespace-nowrap max-w-[120px] truncate">{f.email}</span>
                {deviceName && (
                  <span className="text-[10px] text-slate-400 whitespace-nowrap truncate max-w-[100px] hidden sm:inline">{deviceName}</span>
                )}
              </button>
            );
          })}
        </div>
        <MapContainer
          center={center}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
        >
          <MapContent
            fiscalizadores={fiscalizadoresConUbicacion}
            selectedFiscalizadorEmail={selectedFiscalizadorEmail}
            onNotify={setNotifyTarget}
            onSelectFiscalizador={onSelectFiscalizador}
          />
          <FlyToSelected
            selectedFiscalizador={selectedFiscalizador}
            allFiscalizadores={fiscalizadoresConUbicacion}
          />
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
