import { useState, useCallback } from "react";
import * as tipoInfraccionService from "@/services/tipoInfraccion.service";

export const useTipoInfracciones = () => {
  const [tipoInfracciones, setTipoInfracciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTipoInfracciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tipoInfraccionService.getTipoInfracciones();
      const list = Array.isArray(data) ? data : [];
      const mappedList = list.map(item => ({
        id: item.id,
        nombre: item.nombre,
        descripcion: item.disposicionInfringida || '',
        habilitado: item.habilitado,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }));
      setTipoInfracciones(mappedList);
    } catch (err) {
      console.error("Error fetching tipo infracciones:", err);
      setTipoInfracciones([]);
      setError(
        err.message.includes("403")
          ? "No tienes permisos para ver tipos de infracciones"
          : "No se pudieron cargar los tipos de infracciones"
      );
      throw new Error("No se pudieron cargar los tipos de infracciones");
    } finally {
      setLoading(false);
    }
  }, []);

  const createTipoInfraccion = async (formData) => {
    await tipoInfraccionService.createTipoInfraccionBackend(formData);
    await fetchTipoInfracciones();
  };

  const updateTipoInfraccion = async (id, formData) => {
    await tipoInfraccionService.updateTipoInfraccionBackend(id, formData);
    await fetchTipoInfracciones();
  };

  const deleteTipoInfraccion = async (id) => {
    await tipoInfraccionService.deleteTipoInfraccion(id);
    await fetchTipoInfracciones();
  };

  return {
    tipoInfracciones,
    loading,
    error,
    fetchTipoInfracciones,
    createTipoInfraccion,
    updateTipoInfraccion,
    deleteTipoInfraccion,
  };
};