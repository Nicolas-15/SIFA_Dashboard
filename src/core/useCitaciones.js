import { useState, useEffect, useCallback, useRef } from 'react';
import { getCitaciones, reprogramarCitacion } from '@/services/citaciones.service';
import { useAuth } from './AuthContext';

export const useCitaciones = () => {
  const [citaciones, setCitaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [first, setFirst] = useState(true);
  const [last, setLast] = useState(true);
  const [size, setSize] = useState(10);

  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const { isAuthenticated } = useAuth();

  const latestParams = useRef({
    page: 0,
    dateRange: { startDate: '', endDate: '' },
    searchQuery: '',
    activeFilter: 'all',
  });
  latestParams.current = { page, dateRange, searchQuery, activeFilter };

  const doFetch = useCallback(async (overrides) => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(false);

    try {
      const p = overrides || latestParams.current;

      const result = await getCitaciones({
        page: p.page,
        size,
        startDate: p.dateRange.startDate || undefined,
        endDate: p.dateRange.endDate || undefined,
        search: p.searchQuery || undefined,
      });

      setCitaciones(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
      setFirst(result.first);
      setLast(result.last);

      if (result.number !== p.page) {
        setPage(result.number);
      }
    } catch (err) {
      console.error('Error fetching citaciones:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, size]);

  useEffect(() => {
    doFetch();
  }, [page, dateRange, searchQuery, doFetch]);

  const goToPage = useCallback((p) => setPage(p), []);
  const nextPage = useCallback(() => setPage((prev) => prev + 1), []);
  const prevPage = useCallback(() => setPage((prev) => Math.max(0, prev - 1)), []);

  const updateDateRange = useCallback((range) => {
    setDateRange(range);
    setPage(0);
  }, []);

  const updateSearchQuery = useCallback((query) => {
    setSearchQuery(query);
    setPage(0);
  }, []);

  const updateActiveFilter = useCallback((filter) => {
    setActiveFilter(filter);
    setPage(0);
  }, []);

  const clearFilters = useCallback(() => {
    setDateRange({ startDate: '', endDate: '' });
    setSearchQuery('');
    setActiveFilter('all');
    setPage(0);
  }, []);

  const reprogramar = async (idCitacion, nuevaFecha) => {
    try {
      const result = await reprogramarCitacion(idCitacion, nuevaFecha);
      // Actualización optimista
      setCitaciones(prev =>
        prev.map(c => c.idCitacion === idCitacion ? { ...c, fecha: nuevaFecha } : c)
      );
      doFetch();
      return result;
    } catch (err) {
      console.error('Error al reprogramar citación:', err);
      throw err;
    }
  };

  // Filtrar por próximas/pasadas en el frontend
  const now = new Date();
  const filteredCitaciones = citaciones.filter(c => {
    if (activeFilter === 'all') return true;
    const fechaCita = new Date(c.fecha);
    if (activeFilter === 'upcoming') return fechaCita >= now;
    if (activeFilter === 'past') return fechaCita < now;
    return true;
  });

  return {
    citaciones: filteredCitaciones,
    allCitaciones: citaciones,
    loading,
    error,
    fetchCitaciones: doFetch,
    reprogramar,
    page, totalPages, totalElements, size, first, last,
    goToPage, nextPage, prevPage,
    dateRange, setDateRange: updateDateRange,
    searchQuery, setSearchQuery: updateSearchQuery,
    activeFilter, setActiveFilter: updateActiveFilter,
    clearFilters, setSize,
  };
};
