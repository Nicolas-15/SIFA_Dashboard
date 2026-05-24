import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import * as fiscalizadorActivityService from "@/services/fiscalizadorActivity.service";

export const useFiscalizadoresActivos = () => {
  const [fiscalizadores, setFiscalizadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  const fetchFiscalizadoresActivos = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);
    try {
      const data = await fiscalizadorActivityService.getFiscalizadoresActivos();
      const list = Array.isArray(data) ? data : [];
      const mappedFiscalizadores = list.map((item) => ({
        email: item.emailUsuario,
        latitud: item.latitud,
        longitud: item.longitud,
        ultimaConexion: item.ultimaConexion,
      }));
      setFiscalizadores(mappedFiscalizadores);
    } catch (err) {
      console.error("Error fetching fiscalizadores activos:", err);
      setFiscalizadores([]);
      setError(
        err.message.includes("403")
          ? "No tienes permisos para ver fiscalizadores activos"
          : "No se pudieron cargar los fiscalizadores activos",
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchFiscalizadoresActivos();
  }, [fetchFiscalizadoresActivos]);

  return {
    fiscalizadores,
    loading,
    error,
    fetchFiscalizadoresActivos,
  };
};
