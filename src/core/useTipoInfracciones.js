import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import * as tipoInfraccionService from "@/services/tipoInfraccion.service";

const normalizeTipo = (item) => ({
  id: item.id,
  nombre: item.nombre,
  descripcion: item.disposicionInfringida || "",
  habilitado: item.habilitado,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

export const useTipoInfracciones = () => {
  const [tipoInfracciones, setTipoInfracciones] = useState([]);
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
      const data = await tipoInfraccionService.getTipoInfracciones({ page: p.page, size });

      const list = Array.isArray(data.content) ? data.content : [];
      setTipoInfracciones(list.map(normalizeTipo));
      setTotalPages(data.totalPages ?? 0);
      setTotalElements(data.totalElements ?? 0);
      setFirst(data.first ?? true);
      setLast(data.last ?? true);

      if (data.number !== undefined && data.number !== p.page) {
        setPage(data.number);
      }
    } catch (err) {
      console.error("Error fetching tipo infracciones:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, size]);

  useEffect(() => {
    doFetch();
  }, [page, doFetch]);

  const goToPage = useCallback((p) => setPage(p), []);

  const createTipoInfraccion = async (formData) => {
    await tipoInfraccionService.createTipoInfraccionBackend(formData);
    await doFetch({ page: 0 });
  };

  const updateTipoInfraccion = async (id, formData) => {
    await tipoInfraccionService.updateTipoInfraccionBackend(id, formData);
    await doFetch({ page });
  };

  const deleteTipoInfraccion = async (id) => {
    await tipoInfraccionService.deleteTipoInfraccion(id);
    await doFetch({ page });
  };

  return {
    tipoInfracciones,
    loading,
    error,
    fetchTipoInfracciones: doFetch,
    createTipoInfraccion,
    updateTipoInfraccion,
    deleteTipoInfraccion,
    page,
    totalPages,
    totalElements,
    first,
    last,
    goToPage,
  };
};