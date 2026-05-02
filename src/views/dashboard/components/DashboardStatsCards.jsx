import { Receipt, FileText, Download, CheckCircle } from 'lucide-react';
import { KpiCard } from '@/components/ui/KpiCard';

export function DashboardStatsCards({ infractions }) {
  const stats = {
    total: infractions.length,
    pending: infractions.filter(i => i.status === 'pending').length,
    accepted: infractions.filter(i => i.status === 'accepted').length,
    exported: infractions.filter(i => i.status === 'exported').length,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
      <KpiCard title="Total Infracciones" value={stats.total} color="primary" icon={<Receipt size={20} />} />
      <KpiCard title="Para Verificar" value={stats.pending} color="warning" icon={<FileText size={20} />} />
      <KpiCard title="Aceptadas" value={stats.accepted} color="secondary" icon={<CheckCircle size={20} />} />
      <KpiCard title="Exportadas" value={stats.exported} color="slate" icon={<Download size={20} />} />
    </div>
  );
}
