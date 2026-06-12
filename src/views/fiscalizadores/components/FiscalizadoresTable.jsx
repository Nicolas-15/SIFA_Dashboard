import { useState, Fragment } from "react";
import { MapPin, Clock, Wifi, Smartphone, Bell, ChevronDown, ChevronUp, Cpu, Monitor, Hash, ExternalLink, User } from 'lucide-react';

function AndroidIcon({ size, className }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className} fill="currentColor">
      <path d="M23.35 12.653l2.496-4.323c0.044-0.074 0.070-0.164 0.070-0.26 0-0.287-0.232-0.519-0.519-0.519-0.191 0-0.358 0.103-0.448 0.257l-0.001 0.002-2.527 4.377c-1.887-0.867-4.094-1.373-6.419-1.373s-4.532 0.506-6.517 1.413l0.098-0.040-2.527-4.378c-0.091-0.156-0.259-0.26-0.45-0.26-0.287 0-0.519 0.232-0.519 0.519 0 0.096 0.026 0.185 0.071 0.262l-0.001-0.002 2.496 4.323c-4.286 2.367-7.236 6.697-7.643 11.744l-0.003 0.052h29.991c-0.41-5.099-3.36-9.429-7.57-11.758l-0.076-0.038zM9.098 20.176c-0 0-0 0-0 0-0.69 0-1.249-0.559-1.249-1.249s0.559-1.249 1.249-1.249c0.69 0 1.249 0.559 1.249 1.249v0c-0.001 0.689-0.559 1.248-1.249 1.249h-0zM22.902 20.176c-0 0-0 0-0 0-0.69 0-1.249-0.559-1.249-1.249s0.559-1.249 1.249-1.249c0.69 0 1.249 0.559 1.249 1.249v0c-0.001 0.689-0.559 1.248-1.249 1.249h-0z"></path>
    </svg>
  );
}
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';

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

function DeviceDetailRow({ label, value, icon: Icon }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-xs text-slate-600">
      <Icon size={13} className="text-slate-400 shrink-0" />
      <span className="text-slate-500 min-w-[100px]">{label}:</span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}

function FiscalizadorExpandedRow({ fiscalizador, onShowMap }) {
  const deviceName = [fiscalizador.marcaDispositivo, fiscalizador.modeloDispositivo].filter(Boolean).join(" / ");
  const platformLabel = fiscalizador.platform === "ANDROID" ? "Android" : fiscalizador.platform || null;
  const hasCoords = fiscalizador.latitud !== undefined && fiscalizador.longitud !== undefined;

  return (
    <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dispositivo</span>
          <div className="flex items-center gap-1.5 text-xs text-slate-700">
            <Smartphone size={12} className="text-slate-400 shrink-0" />
            <span className="font-semibold truncate">{deviceName || '—'}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Versión App</span>
          <div className="flex items-center gap-1.5 text-xs text-slate-700">
            <Cpu size={12} className="text-slate-400 shrink-0" />
            <span className="font-semibold">{fiscalizador.versionApp ? `v${fiscalizador.versionApp}` : '—'}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plataforma</span>
          <div className="flex items-center gap-1.5 text-xs text-slate-700">
            {platformLabel ? <AndroidIcon size={12} className="text-emerald-500 shrink-0" /> : <Monitor size={12} className="text-slate-400 shrink-0" />}
            <span className="font-semibold">{platformLabel || '—'}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID</span>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Hash size={12} className="text-slate-400 shrink-0" />
            <span className="font-medium font-mono text-[10px] truncate">{fiscalizador.deviceId || '—'}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Último Reporte</span>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Clock size={12} className="text-slate-400 shrink-0" />
            <span className="font-medium">{new Date(fiscalizador.ultimaConexion).toLocaleString('es-CL')}</span>
          </div>
        </div>
        {hasCoords && (
          <div className="flex items-end justify-end md:col-span-2">
            <button
              onClick={(e) => { e.stopPropagation(); onShowMap?.(fiscalizador); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-xs rounded-lg transition-colors"
            >
              <ExternalLink size={13} />
              Ver ubicación
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function FiscalizadoresTable({ loading, filtered, search, onNotify, onShowMap }) {
  const [expandedEmail, setExpandedEmail] = useState(null);

  const toggleExpand = (email) => {
    setExpandedEmail((prev) => (prev === email ? null : email));
  };

  return (
    <div className="overflow-auto flex-1">
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold sticky top-0 z-10">
            <th className="px-6 py-4 w-10"></th>
            <th className="px-6 py-4">Email</th>
            <th className="px-6 py-4">Última Conexión</th>
            <th className="px-6 py-4">Ubicación</th>
            <th className="px-6 py-4">Dispositivo</th>
            <th className="px-6 py-4">Estado</th>
            <th className="px-6 py-4 w-20">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading && filtered.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-6 py-24">
                <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Spinner />
                  <span className="text-sm font-medium">Cargando fiscalizadores activos...</span>
                </div>
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan="7">
                <EmptyState query={search} resource="fiscalizadores activos" />
              </td>
            </tr>
          ) : (
            filtered.map((f) => {
              const deviceName = [f.marcaDispositivo, f.modeloDispositivo].filter(Boolean).join(" / ");
              const isExpanded = expandedEmail === f.email;

              return (
                <Fragment key={f.email}>
                  <tr
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    onClick={() => toggleExpand(f.email)}
                  >
                    <td className="px-6 py-4">
                      <button
                        className="p-0.5 rounded text-slate-400 hover:text-slate-600 transition-colors"
                        onClick={(e) => { e.stopPropagation(); toggleExpand(f.email); }}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400 shrink-0" />
                        <p className="text-sm font-bold text-slate-800">{f.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock size={14} className="text-slate-400" />
                        {formatLastConnection(f.ultimaConexion)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin size={14} className="text-slate-400 shrink-0" />
                        <span className="font-mono">
                          {f.latitud?.toFixed(4)}, {f.longitud?.toFixed(4)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {deviceName ? (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Smartphone size={14} className="text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]" title={deviceName}>
                            {deviceName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
                        <Wifi size={14} />
                        En terreno
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            f.deviceRegistered ? "bg-emerald-500" : "bg-red-400"
                          }`}
                          title={f.deviceRegistered ? "Dispositivo registrado para notificaciones" : "Sin registro de notificaciones push"}
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); onNotify?.(f); }}
                          disabled={!f.deviceRegistered}
                          title={f.deviceRegistered ? "Enviar notificación push" : "Sin dispositivo registrado para notificaciones"}
                          className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Bell size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${f.email}-detail`} className="bg-slate-50/30">
                      <td colSpan="7" className="p-0">
                        <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                          <FiscalizadorExpandedRow
                            fiscalizador={f}
                            onShowMap={onShowMap}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
