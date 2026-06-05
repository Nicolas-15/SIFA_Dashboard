import { useState, useEffect, useCallback, useRef } from "react";
import { getAuditLogs } from "@/services/audits.service";
import { useAuth } from "./AuthContext";

export const useAudits = () => {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Estados de paginación
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [first, setFirst] = useState(true);
  const [last, setLast] = useState(true);
  const [size, setSize] = useState(10);
  const [numberOfElements, setNumberOfElements] = useState(0);

  // Estados de filtros
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [userFilter, setUserFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { isAuthenticated } = useAuth();

  // Ref para mantener los últimos parámetros
  const latestParams = useRef({
    page: 0,
    dateRange: { startDate: "", endDate: "" },
    userFilter: "",
    searchQuery: "",
  });
  latestParams.current = { page, dateRange, userFilter, searchQuery };

  // Función principal de fetch
  const doFetch = useCallback(
    async (overrides) => {
      if (!isAuthenticated) return;

      setLoading(true);
      setError(false);

      try {
        const p = overrides || latestParams.current;

        const result = await getAuditLogs({
          page: p.page,
          size,
          startDate: p.dateRange.startDate || undefined,
          endDate: p.dateRange.endDate || undefined,
          user: p.userFilter || undefined,
          search: p.searchQuery || undefined,
        });

        setAudits(result.content || []);
        setTotalPages(result.totalPages ?? 0);
        setTotalElements(result.totalElements ?? 0);
        setFirst(result.first ?? true);
        setLast(result.last ?? true);
        setNumberOfElements(result.numberOfElements ?? 0);

        // Si el backend devuelve un número de página diferente, actualizar
        if (result.number !== p.page) {
          setPage(result.number);
        }
      } catch (err) {
        console.error("Error fetching audits:", err);
        setError(true);
        setAudits([]);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, size],
  );

  // Efecto para cargar datos cuando cambian los parámetros
  useEffect(() => {
    doFetch();
  }, [page, dateRange, userFilter, searchQuery, doFetch]);

  // Manejadores de paginación
  const goToPage = useCallback((p) => setPage(p), []);
  const nextPage = useCallback(() => {
    if (!last) setPage((prev) => prev + 1);
  }, [last]);
  const prevPage = useCallback(() => {
    if (!first) setPage((prev) => Math.max(0, prev - 1));
  }, [first]);

  // Manejadores de filtros
  const updateDateRange = useCallback((range) => {
    setDateRange(range);
    setPage(0);
  }, []);

  const updateUserFilter = useCallback((user) => {
    setUserFilter(user);
    setPage(0);
  }, []);

  const updateSearchQuery = useCallback((query) => {
    setSearchQuery(query);
    setPage(0);
  }, []);

  const clearFilters = useCallback(() => {
    setDateRange({ startDate: "", endDate: "" });
    setUserFilter("");
    setSearchQuery("");
    setPage(0);
  }, []);

  const updateSize = useCallback((newSize) => {
    setSize(newSize);
    setPage(0);
  }, []);

  // Retornar todos los estados y funciones
  return {
    // Datos
    audits,
    loading,
    error,
    fetchAudits: doFetch,

    // Paginación
    page,
    totalPages,
    totalElements,
    size,
    first,
    last,
    numberOfElements,
    goToPage,
    nextPage,
    prevPage,

    // Filtros
    dateRange,
    setDateRange: updateDateRange,
    userFilter,
    setUserFilter: updateUserFilter,
    searchQuery,
    setSearchQuery: updateSearchQuery,
    clearFilters,
    setSize: updateSize,
  };
};
