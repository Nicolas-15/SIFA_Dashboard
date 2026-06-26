import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Modal } from "@/components/ui/Modal";
import { MapPin } from "lucide-react";

function createMapMarkerIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 32px; height: 32px;
      background: #3b82f6;
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    "><div style="transform: rotate(45deg); width: 12px; height: 12px; background: white; border-radius: 50%;"></div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

function FitSingleMarker({ lat, lng }) {
  const map = useMap();
  if (lat !== undefined && lng !== undefined) {
    map.setView([lat, lng], 15, { animate: true });
  }
  return null;
}

export function MapModal({ isOpen, onClose, latitude, longitude, label, title }) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title ?? "Ubicación"}
      maxWidth="max-w-3xl"
      maxHeight="max-h-[80vh]"
      closeOnBackdropClick
    >
      <div className="w-full h-[400px] rounded-xl overflow-hidden">
        <MapContainer
          center={[latitude ?? -33.0456, longitude ?? -71.6214]}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <FitSingleMarker lat={latitude} lng={longitude} />
          {latitude !== undefined && longitude !== undefined && (
            <Marker
              position={[latitude, longitude]}
              icon={createMapMarkerIcon()}
            >
              <Popup>
                <div className="flex items-center gap-2 px-1 py-0.5">
                  <MapPin size={14} className="text-blue-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-700">
                    {label ?? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`}
                  </span>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </Modal>
  );
}
