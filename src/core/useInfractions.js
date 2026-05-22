import { useState, useEffect, useCallback, useRef } from 'react';
import { getInfractions, updateInfractionStatus, updateInfractionData } from '@/services/infractions.service';
import { useAuth } from './AuthContext';

const normalizeStatus = (s) => ({
  'en proceso': 'pending', 'en_proceso': 'pending', 'pendiente': 'pending', 'pending': 'pending',
  'aprobada': 'accepted', 'aceptada': 'accepted', 'aprobado': 'accepted', 'aceptado': 'accepted', 'accepted': 'accepted',
  'rechazada': 'rejected', 'rechazado': 'rejected', 'rejected': 'rejected',
  'exportada': 'exported', 'exportado': 'exported', 'exported': 'exported',
})[s?.toLowerCase()] || 'pending';

export const useInfractions = () => {
  const [infractions, setInfractions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [first, setFirst] = useState(true);
  const [last, setLast] = useState(true);
  const [size] = useState(10);

  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [userFilter, setUserFilter] = useState('');

  const { isAuthenticated } = useAuth();

  const latestParams = useRef({ page: 0, dateRange: { startDate: '', endDate: '' }, userFilter: '' });
  latestParams.current = { page, dateRange, userFilter };

  const doFetch = useCallback(async (overrides) => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(false);

    try {
      const p = overrides || latestParams.current;
      const result = await getInfractions({
        page: p.page,
        size,
        startDate: p.dateRange.startDate || undefined,
        endDate: p.dateRange.endDate || undefined,
        user: p.userFilter || undefined,
      });

      setInfractions(result.content.map(inf => ({ ...inf, status: normalizeStatus(inf.status) })));
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
      setFirst(result.first);
      setLast(result.last);

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
  }, [page, dateRange, userFilter, doFetch]);

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

  const clearFilters = useCallback(() => {
    setDateRange({ startDate: '', endDate: '' });
    setUserFilter('');
    setPage(0);
  }, []);

  const updateStatus = async (id, newStatus, motivoRechazo) => {
    // Actualización optimista
    setInfractions(prev =>
      prev.map(inf => inf.id === id ? { ...inf, status: newStatus, motivoRechazo: newStatus === 'rejected' ? motivoRechazo : null } : inf)
    );
    try {
      await updateInfractionStatus(id, newStatus, motivoRechazo);
      return true;
    } catch (err) {
      console.error('Error al persistir estado en la API:', err);
      fetchInfractions();
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
    infractions, loading, error, fetchInfractions: doFetch, updateStatus, saveInfractionEdit,
    page, totalPages, totalElements, size, first, last,
    goToPage, nextPage, prevPage,
    dateRange, setDateRange: updateDateRange,
    userFilter, setUserFilter: updateUserFilter,
    clearFilters,
  };
};
