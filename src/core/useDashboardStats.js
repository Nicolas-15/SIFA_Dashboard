import { useState, useEffect, useCallback } from 'react';
import { getDashboardStats } from '@/services/infractions.service';
import { useAuth } from './AuthContext';

/**
 * Hook dedicado para las estadísticas del Dashboard.
 * Consume el endpoint liviano GET /estadisticas que retorna:
 *  - totalInfracciones
 *  - cantidadPorEstado (GROUP BY estado)
 *  - fechaInicio / fechaFin aplicados
 *
 * Por defecto filtra por el día actual (diario).
 */
export const useDashboardStats = (startDate, endDate) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const { isAuthenticated } = useAuth();

  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(false);

    try {
      const data = await getDashboardStats({ startDate, endDate });
      setStats(data);
    } catch (err) {
      console.error('Error al obtener estadísticas del Dashboard:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, startDate, endDate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Adaptar para las KPI Cards del dashboard
  const kpiStats = stats
    ? {
        total: stats.totalInfracciones ?? 0,
        pending: stats.cantidadPorEstado?.pending ?? 0,
        accepted: stats.cantidadPorEstado?.accepted ?? 0,
        rejected: stats.cantidadPorEstado?.rejected ?? 0,
        exported: stats.cantidadPorEstado?.exported ?? 0,
      }
    : { total: 0, pending: 0, accepted: 0, rejected: 0, exported: 0 };

  return {
    stats,
    kpiStats,
    loading,
    error,
    refetch: fetchStats,
  };
};
