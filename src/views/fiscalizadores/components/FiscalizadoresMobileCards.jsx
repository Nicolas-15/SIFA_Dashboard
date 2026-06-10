import { useState } from "react";
import { MapPin, Clock, Wifi, Smartphone, Bell, Cpu, Monitor, Hash, Crosshair, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
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
              <p className="text-sm font-bold text-slate-800 truncate flex-1 mr-2">
                {f.email}
              </p>
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
              <div className="mt-2 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                {f.versionApp && (
                  <div className="flex items-center gap-2">
                    <Cpu size={13} className="text-slate-400 shrink-0" />
                    <span className="text-slate-500">Versión App:</span>
                    <span className="font-medium text-slate-700">v{f.versionApp}</span>
                  </div>
                )}
                {f.manufacturer && (
                  <div className="flex items-center gap-2">
                    <Monitor size={13} className="text-slate-400 shrink-0" />
                    <span className="text-slate-500">Fabricante:</span>
                    <span className="font-medium text-slate-700">{f.manufacturer}</span>
                  </div>
                )}
                {f.deviceId && (
                  <div className="flex items-center gap-2">
                    <Hash size={13} className="text-slate-400 shrink-0" />
                    <span className="text-slate-500">ID:</span>
                    <span className="font-medium text-slate-700 font-mono text-[10px] truncate">{f.deviceId}</span>
                  </div>
                )}
                {platformLabel && (
                  <div className="flex items-center gap-2">
                    <Cpu size={13} className="text-slate-400 shrink-0" />
                    <span className="text-slate-500">Plataforma:</span>
                    <span className="font-medium text-slate-700">{platformLabel}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-slate-400 shrink-0" />
                  <span className="text-slate-500">Último reporte:</span>
                  <span className="font-medium text-slate-700">
                    {f.ultimaConexion ? new Date(f.ultimaConexion).toLocaleString('es-CL') : '—'}
                  </span>
                </div>
                {hasCoords && (
                  <button
                    onClick={() => onShowMap?.(f)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-xs rounded-lg transition-colors mt-1"
                  >
                    <ExternalLink size={13} />
                    Ver ubicación en mapa
                  </button>
                )}
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => onNotify?.(f)}
                disabled={!f.deviceId}
                title={f.deviceId ? "Enviar notificación push" : "Sin dispositivo registrado"}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Bell size={14} />
                Notificar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
