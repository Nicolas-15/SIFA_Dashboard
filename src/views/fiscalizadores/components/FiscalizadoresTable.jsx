import { useState, Fragment } from "react";
import { MapPin, Clock, Wifi, Smartphone, Bell, ChevronDown, ChevronUp, Cpu, Monitor, Hash, Crosshair, ExternalLink } from 'lucide-react';
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
        {deviceName && (
          <DeviceDetailRow label="Dispositivo" value={deviceName} icon={Smartphone} />
        )}
        {fiscalizador.versionApp && (
          <DeviceDetailRow label="Versión App" value={`v${fiscalizador.versionApp}`} icon={Cpu} />
        )}
        {fiscalizador.manufacturer && (
          <DeviceDetailRow label="Fabricante" value={fiscalizador.manufacturer} icon={Monitor} />
        )}
        {fiscalizador.deviceId && (
          <DeviceDetailRow label="ID Dispositivo" value={fiscalizador.deviceId} icon={Hash} />
        )}
        {platformLabel && (
          <DeviceDetailRow label="Plataforma" value={platformLabel} icon={Cpu} />
        )}
        <DeviceDetailRow
          label="Último reporte"
          value={new Date(fiscalizador.ultimaConexion).toLocaleString('es-CL')}
          icon={Clock}
        />
        {hasCoords && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Crosshair size={13} className="text-slate-400 shrink-0" />
            <span className="text-slate-500 min-w-[100px]">Coordenadas:</span>
            <span className="font-mono font-medium text-slate-700">
              {fiscalizador.latitud.toFixed(5)}, {fiscalizador.longitud.toFixed(5)}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onShowMap?.(fiscalizador); }}
              className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              title="Ver en mapa"
            >
              <ExternalLink size={12} />
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
                      <p className="text-sm font-bold text-slate-800">{f.email}</p>
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
                      <button
                        onClick={(e) => { e.stopPropagation(); onNotify?.(f); }}
                        disabled={!f.deviceId}
                        title={f.deviceId ? "Enviar notificación push" : "Sin dispositivo registrado"}
                        className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Bell size={16} />
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${f.email}-detail`} className="bg-slate-50/30">
                      <td colSpan="7" className="p-0">
                        <FiscalizadorExpandedRow
                          fiscalizador={f}
                          onShowMap={onShowMap}
                        />
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
