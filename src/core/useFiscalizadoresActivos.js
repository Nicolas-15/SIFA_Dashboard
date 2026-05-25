import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import * as fiscalizadorActivityService from "@/services/fiscalizadorActivity.service";

const normalizeFiscalizador = (item) => ({
  email: item.emailUsuario,
  latitud: item.latitud,
  longitud: item.longitud,
  ultimaConexion: item.ultimaConexion,
});

export const useFiscalizadoresActivos = () => {
  const [fiscalizadores, setFiscalizadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [first, setFirst] = useState(true);
  const [last, setLast] = useState(true);
  const [size] = useState(10);

  const { isAuthenticated } = useAuth();

  const latestParams = useRef({ page: 0 });
  latestParams.current = { page };

  const doFetch = useCallback(async (overrides) => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(false);

    try {
      const p = overrides || latestParams.current;
      const data = await fiscalizadorActivityService.getFiscalizadoresActivos({ page: p.page, size });

      const list = Array.isArray(data.content) ? data.content : [];
      setFiscalizadores(list.map(normalizeFiscalizador));
      setTotalPages(data.totalPages ?? 0);
      setTotalElements(data.totalElements ?? 0);
      setFirst(data.first ?? true);
      setLast(data.last ?? true);

      if (data.number !== undefined && data.number !== p.page) {
        setPage(data.number);
      }
    } catch (err) {
      console.error("Error fetching fiscalizadores activos:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, size]);

  useEffect(() => {
    doFetch();
  }, [page, doFetch]);

  const goToPage = useCallback((p) => setPage(p), []);

  return {
    fiscalizadores,
    loading,
    error,
    fetchFiscalizadoresActivos: doFetch,
    page,
    totalPages,
    totalElements,
    first,
    last,
    goToPage,
  };
};