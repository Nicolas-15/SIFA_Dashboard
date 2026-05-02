import { Receipt } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';

export function DashboardRecentActivity({ infractions }) {
  const recentInfractions = [...infractions]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  return (
    <Card>
      <h3 className="text-base font-bold text-slate-800 mb-4">Actividad Reciente</h3>
      <div className="space-y-3">
        {recentInfractions.map(inf => (
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
    </Card>
  );
}
