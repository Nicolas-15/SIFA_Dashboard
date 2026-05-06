import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Card } from '@/components/ui/Card';

const BAR_COLORS = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export function DashboardBarChart({ infractions }) {
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
    <Card className="lg:col-span-2">
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
            <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
            <YAxis type="category" dataKey="type" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={145} tickFormatter={shortLabel} />
            <Tooltip
              formatter={(value) => [value, 'Infracciones']}
              contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', color: '#1e293b' }}
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
    </Card>
  );
}
