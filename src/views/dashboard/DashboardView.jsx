import { useOutletContext } from 'react-router-dom';
import { DashboardStatsCards } from './components/DashboardStatsCards';
import { DashboardBarChart } from './components/DashboardBarChart';
import { DashboardRecentActivity } from './components/DashboardRecentActivity';

export function DashboardView() {
  const { infractions } = useOutletContext();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">Resumen Diario</h2>
        <p className="text-sm text-slate-500 mt-0.5">Vista general del Sistema de Inteligencia para Fiscalización Automática</p>
      </div>

      <DashboardStatsCards infractions={infractions} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <DashboardBarChart infractions={infractions} />
        <DashboardRecentActivity infractions={infractions} />
      </div>
    </div>
  );
}
