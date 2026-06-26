import { useState, useEffect, useCallback, useRef } from 'react';
import { getInfractions, updateInfractionStatus, updateInfractionData, getDashboardStats } from '@/services/infractions.service';
import { useAuth } from './AuthContext';

const normalizeStatus = (s) => ({
  'en proceso': 'pending', 'en_proceso': 'pending', 'pendiente': 'pending', 'pending': 'pending',
  'aprobada': 'accepted', 'aceptada': 'accepted', 'aprobado': 'accepted', 'aceptado': 'accepted', 'accepted': 'accepted',
  'rechazada': 'rejected', 'rechazado': 'rejected', 'rejected': 'rejected',
  'exportada': 'exported', 'exportado': 'exported', 'exported': 'exported',
})[s?.toLowerCase()] || 'pending';

export const useInfractions = () => {
  const [infractions, setInfractions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [first, setFirst] = useState(true);
  const [last, setLast] = useState(true);
  const [size, setSize] = useState(10);

  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [userFilter, setUserFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { isAuthenticated } = useAuth();

  const latestParams = useRef({ page: 0, dateRange: { startDate: '', endDate: '' }, userFilter: '', activeFilter: 'all', searchQuery: '' });
  latestParams.current = { page, dateRange, userFilter, activeFilter, searchQuery };

  const doFetch = useCallback(async (overrides) => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(false);

    try {
      const p = overrides || latestParams.current;
      const statusParam = p.activeFilter === 'all' ? undefined : p.activeFilter;
      const searchParam = p.searchQuery || undefined;

      const [result, statsResult] = await Promise.all([
        getInfractions({
          page: p.page,
          size,
          startDate: p.dateRange.startDate || undefined,
          endDate: p.dateRange.endDate || undefined,
          user: p.userFilter || undefined,
          status: statusParam,
          search: searchParam,
        }),
        getDashboardStats({
          startDate: p.dateRange.startDate || undefined,
          endDate: p.dateRange.endDate || undefined,
          user: p.userFilter || undefined,
          search: searchParam,
        })
      ]);

      setInfractions(result.content.map(inf => ({ ...inf, status: normalizeStatus(inf.status) })));
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
      setFirst(result.first);
      setLast(result.last);

      setStats(statsResult);

      if (result.number !== p.page) {
        setPage(result.number);
      }
    } catch (err) {
      console.error('Error fetching infractions:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, size]);

  useEffect(() => {
    doFetch();
  }, [page, dateRange, userFilter, activeFilter, searchQuery, doFetch]);

  const goToPage = useCallback((p) => setPage(p), []);
  const nextPage = useCallback(() => setPage((prev) => prev + 1), []);
  const prevPage = useCallback(() => setPage((prev) => Math.max(0, prev - 1)), []);

  const updateDateRange = useCallback((range) => {
    setDateRange(range);
    setPage(0);
  }, []);

  const updateUserFilter = useCallback((user) => {
    setUserFilter(user);
    setPage(0);
  }, []);

  const updateActiveFilter = useCallback((filter) => {
    setActiveFilter(filter);
    setPage(0);
  }, []);

  const updateSearchQuery = useCallback((query) => {
    setSearchQuery(query);
    setPage(0);
  }, []);

  const clearFilters = useCallback(() => {
    setDateRange({ startDate: '', endDate: '' });
    setUserFilter('');
    setPage(0);
  }, []);

  const updateSize = useCallback((newSize) => {
    setSize(newSize);
    setPage(0);
  }, []);

  const updateStatus = async (id, newStatus, motivoRechazo) => {
    // Buscar la infracción modificada en el estado local actual
    const originalInf = infractions.find(inf => inf.id === id);
    const oldStatus = originalInf ? originalInf.status : null;

    // Actualización optimista de la infracción
    setInfractions(prev =>
      prev.map(inf => inf.id === id ? { ...inf, status: newStatus, motivoRechazo: newStatus === 'rejected' ? motivoRechazo : null } : inf)
    );

    // Actualización optimista de las estadísticas globales
    if (oldStatus && oldStatus !== newStatus) {
      setStats(prev => {
        if (!prev || !prev.cantidadPorEstado) return prev;
        const newCantidad = { ...prev.cantidadPorEstado };
        
        // Disminuir contador del estado anterior
        if (newCantidad[oldStatus] !== undefined) {
          newCantidad[oldStatus] = Math.max(0, newCantidad[oldStatus] - 1);
        }
        // Aumentar contador del nuevo estado
        if (newCantidad[newStatus] !== undefined) {
          newCantidad[newStatus] = (newCantidad[newStatus] || 0) + 1;
        }

        return {
          ...prev,
          cantidadPorEstado: newCantidad,
        };
      });
    }

    try {
      await updateInfractionStatus(id, newStatus, motivoRechazo);
      doFetch(); // Actualizar después para refrescar contadores
      return true;
    } catch (err) {
      console.error('Error al persistir estado en la API:', err);
      doFetch();
      return false;
    }
  };

  const saveInfractionEdit = async (id, updatedFields) => {
    try {
      await updateInfractionData(id, updatedFields);
      setInfractions(prev =>
        prev.map(inf => inf.id === id ? { ...inf, ...updatedFields } : inf)
      );
      return true;
    } catch (err) {
      console.error('Error al persistir edición en la API:', err);
      throw err;
    }
  };

  return {
    infractions, stats, loading, error, fetchInfractions: doFetch, updateStatus, saveInfractionEdit,
    page, totalPages, totalElements, size, first, last,
    goToPage, nextPage, prevPage,
    dateRange, setDateRange: updateDateRange,
    userFilter, setUserFilter: updateUserFilter,
    activeFilter, setActiveFilter: updateActiveFilter,
    searchQuery, setSearchQuery: updateSearchQuery,
    clearFilters, setSize: updateSize,
  };
};
