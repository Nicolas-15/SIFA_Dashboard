import { useState } from "react";
import { MapPin, Clock, Wifi, Smartphone, Bell, Cpu, Monitor, Hash, ExternalLink, ChevronDown, ChevronUp, User } from 'lucide-react';
import { formatDateTime } from "@/utils/date";

function AndroidIcon({ size, className }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className} fill="currentColor">
      <path d="M23.35 12.653l2.496-4.323c0.044-0.074 0.070-0.164 0.070-0.26 0-0.287-0.232-0.519-0.519-0.519-0.191 0-0.358 0.103-0.448 0.257l-0.001 0.002-2.527 4.377c-1.887-0.867-4.094-1.373-6.419-1.373s-4.532 0.506-6.517 1.413l0.098-0.040-2.527-4.378c-0.091-0.156-0.259-0.26-0.45-0.26-0.287 0-0.519 0.232-0.519 0.519 0 0.096 0.026 0.185 0.071 0.262l-0.001-0.002 2.496 4.323c-4.286 2.367-7.236 6.697-7.643 11.744l-0.003 0.052h29.991c-0.41-5.099-3.36-9.429-7.57-11.758l-0.076-0.038zM9.098 20.176c-0 0-0 0-0 0-0.69 0-1.249-0.559-1.249-1.249s0.559-1.249 1.249-1.249c0.69 0 1.249 0.559 1.249 1.249v0c-0.001 0.689-0.559 1.248-1.249 1.249h-0zM22.902 20.176c-0 0-0 0-0 0-0.69 0-1.249-0.559-1.249-1.249s0.559-1.249 1.249-1.249c0.69 0 1.249 0.559 1.249 1.249v0c-0.001 0.689-0.559 1.248-1.249 1.249h-0z"></path>
    </svg>
  );
}
import { EmptyState } from '@/components/ui/EmptyState';

function formatLastConnection(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  return date.toLocaleString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
  });
}

export function FiscalizadoresMobileCards({ filtered, search, onNotify, onShowMap }) {
  const [expandedEmail, setExpandedEmail] = useState(null);

  if (filtered.length === 0) {
    return <EmptyState query={search} resource="fiscalizadores activos" />;
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {filtered.map((f) => {
        const deviceName = [f.marcaDispositivo, f.modeloDispositivo].filter(Boolean).join(" / ");
        const platformLabel = f.platform === "ANDROID" ? "Android" : f.platform || null;
        const isExpanded = expandedEmail === f.email;
        const hasCoords = f.latitud !== undefined && f.longitud !== undefined;

        return (
          <div
            key={f.email}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                <User size={14} className="text-slate-400 shrink-0" />
                <p className="text-sm font-bold text-slate-800 truncate">{f.email}</p>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs shrink-0">
                <Wifi size={12} />
                En terreno
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-slate-400 shrink-0" />
                <span>{formatLastConnection(f.ultimaConexion)}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-slate-400 shrink-0" />
                <span className="font-mono">
                  {f.latitud?.toFixed(4)}, {f.longitud?.toFixed(4)}
                </span>
              </div>

              {deviceName && (
                <div className="flex items-center gap-2">
                  <Smartphone size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{deviceName}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setExpandedEmail(isExpanded ? null : f.email)}
              className="mt-2 w-full inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors"
            >
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {isExpanded ? "Menos información" : "Más información"}
            </button>

            {isExpanded && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-500 mt-2 pt-3 border-t border-slate-100 grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Dispositivo</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700">
                    <Smartphone size={12} className="text-slate-400 shrink-0" />
                    <span className="font-semibold truncate">{deviceName || '—'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Versión App</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700">
                    <Cpu size={12} className="text-slate-400 shrink-0" />
                    <span className="font-semibold">{f.versionApp ? `v${f.versionApp}` : '—'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Plataforma</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700">
                    {platformLabel ? <AndroidIcon size={12} className="text-emerald-500 shrink-0" /> : <Monitor size={12} className="text-slate-400 shrink-0" />}
                    <span className="font-semibold">{platformLabel || '—'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">ID</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Hash size={12} className="text-slate-400 shrink-0" />
                    <span className="font-medium font-mono text-[10px] truncate">{f.deviceId || '—'}</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Último Reporte</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Clock size={12} className="text-slate-400 shrink-0" />
                    <span className="font-medium">{formatDateTime(f.ultimaConexion)}</span>
                  </div>
                </div>
                {hasCoords && (
                  <div className="col-span-2">
                    <button
                      onClick={() => onShowMap?.(f)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-xs rounded-lg transition-colors"
                    >
                      <ExternalLink size={13} />
                      Ver ubicación en mapa
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => onNotify?.(f)}
                disabled={!f.deviceRegistered}
                title={f.deviceRegistered ? "Enviar notificación push" : "Sin dispositivo registrado para notificaciones"}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Bell size={14} />
                Notificar
              </button>
              <span className={`text-[10px] font-semibold ${f.deviceRegistered ? "text-emerald-600" : "text-red-400"}`}>
                {f.deviceRegistered ? "Registrado" : "Sin registro"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
