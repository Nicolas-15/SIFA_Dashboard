import { Receipt, FileText, Download, CheckCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { KpiCard } from '../../components/ui/KpiCard';
import { StatusBadge } from '../../components/ui/StatusBadge';

const BAR_COLORS = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

function getDashboardStats(infractions) {
  return {
    total: infractions.length,
    pending: infractions.filter(i => i.status === 'pending').length,
    accepted: infractions.filter(i => i.status === 'accepted').length,
    exported: infractions.filter(i => i.status === 'exported').length,
  };
}

export function DashboardView({ infractions }) {
  const stats = getDashboardStats(infractions);

  /* Agrupa infracciones por tipo para el gráfico de barras */
  const typeData = Object.entries(
    infractions.reduce((acc, inf) => {
      const desc = inf.infractionDescription || 'No especificada';
      acc[desc] = (acc[desc] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const shortLabel = (label) =>
    label.length > 22 ? label.slice(0, 20) + '…' : label;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">Resumen Diario</h2>
        <p className="text-sm text-slate-500 mt-0.5">Vista general del Sistema de Inteligencia para Fiscalización Automática</p>
      </div>

      {/* KPIs — 2 columnas en móvil, 4 en desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        <KpiCard title="Total Infracciones" value={stats.total} color="primary" icon={<Receipt size={20} />} />
        <KpiCard title="Para Verificar" value={stats.pending} color="warning" icon={<FileText size={20} />} />
        <KpiCard title="Aceptadas" value={stats.accepted} color="secondary" icon={<CheckCircle size={20} />} />
        <KpiCard title="Exportadas" value={stats.exported} color="slate" icon={<Download size={20} />} />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

        {/* Gráfico de barras: tipos de infracción */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-0.5">Tipos de Infracción</h3>
          <p className="text-xs text-slate-500 mb-5">Infracciones más frecuentes en la comuna</p>
          <div className="h-52 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={typeData}
                layout="vertical"
                margin={{ left: 0, right: 24, top: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="type"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={145}
                  tickFormatter={shortLabel}
                />
                <Tooltip
                  formatter={(value) => [value, 'Infracciones']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderColor: '#e2e8f0',
                    borderRadius: '10px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    color: '#1e293b',
                  }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
                  {typeData.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            {[...infractions]
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .slice(0, 5)
              .map(inf => (
                <div key={inf.id} className="flex gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Receipt size={15} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-sm font-bold text-slate-800 font-mono">{inf.vehicle?.plate || 'S/P'}</p>
                      <StatusBadge status={inf.status} tiny />
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{inf.infractionDescription}</p>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                      {new Date(inf.timestamp).toLocaleTimeString('es-CL')}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
