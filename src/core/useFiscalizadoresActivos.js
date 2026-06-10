import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import { SYSTEM_ROLES } from "@/constants/roles";
import * as fiscalizadorActivityService from "@/services/fiscalizadorActivity.service";
import { getAllDevices } from "@/services/pushNotifications.service";

const normalizeFiscalizador = (item) => ({
  email: item.emailUsuario,
  latitud: item.latitud,
  longitud: item.longitud,
  ultimaConexion: item.ultimaConexion,
  deviceId: item.idDispositivo || item.deviceId,
  marcaDispositivo: item.marcaDispositivo || item.marca,
  modeloDispositivo: item.modeloDispositivo || item.modelo,
  versionApp: item.versionApp || item.appVersion,
  platform: item.platform,
  manufacturer: item.fabricante || item.manufacturer,
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

  const { isAuthenticated, currentUser } = useAuth();

  const latestParams = useRef({ page: 0 });
  latestParams.current = { page };

  const doFetch = useCallback(async (overrides) => {
    if (!isAuthenticated) return;

    // Solo Administradores y Supervisores tienen permiso para ver fiscalizadores activos
    const isSupervisorOrAdmin =
      currentUser?.role === SYSTEM_ROLES.ADMIN ||
      currentUser?.role === SYSTEM_ROLES.SUPERVISOR;

    if (!isSupervisorOrAdmin) {
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const p = overrides || latestParams.current;
      const [activosData, devices] = await Promise.all([
        fiscalizadorActivityService.getFiscalizadoresActivos({ page: p.page, size }),
        getAllDevices().catch(() => []),
      ]);

      const devicesByEmail = {};
      if (Array.isArray(devices)) {
        devices.forEach((d) => {
          if (d.emailUsuario) devicesByEmail[d.emailUsuario] = d;
        });
      }

      const list = Array.isArray(activosData.content) ? activosData.content : [];
      setFiscalizadores(list.map((item) => {
        const base = normalizeFiscalizador(item);
        const deviceInfo = devicesByEmail[base.email];
        if (deviceInfo) {
          base.versionApp = base.versionApp || deviceInfo.appVersion;
          base.platform = base.platform || deviceInfo.platform;
          base.manufacturer = base.manufacturer || deviceInfo.manufacturer;
        }
        return base;
      }));
      setTotalPages(activosData.totalPages ?? 0);
      setTotalElements(activosData.totalElements ?? 0);
      setFirst(activosData.first ?? true);
      setLast(activosData.last ?? true);

      if (activosData.number !== undefined && activosData.number !== p.page) {
        setPage(activosData.number);
      }
    } catch (err) {
      console.error("Error fetching fiscalizadores activos:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentUser, size]);

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