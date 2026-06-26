import { useState, useEffect, useCallback } from "react";
import {
  sendAllPush,
  sendOutdatedPush,
  sendSelectPush,
  getAllDevices,
  getNotificationHistory,
} from "@/services/pushNotifications.service";

const TARGET_TYPES = {
  ALL: "ALL",
  OUTDATED: "OUTDATED",
  SELECT: "SELECT",
};

function usePushNotifications() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(false);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(0);
  const [historyTotalElements, setHistoryTotalElements] = useState(0);
  const [historyFirst, setHistoryFirst] = useState(true);
  const [historyLast, setHistoryLast] = useState(true);
  const [historyFilter, setHistoryFilter] = useState(null);

  const fetchDevices = useCallback(async () => {
    setDevicesLoading(true);
    try {
      const data = await getAllDevices();
      setDevices(data || []);
    } catch {
      setDevices([]);
    } finally {
      setDevicesLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async (page = 0, targetType = null) => {
    setHistoryLoading(true);
    try {
      const data = await getNotificationHistory({ page, size: 10, targetType });
      setHistory(data.content || []);
      setHistoryPage(data.number ?? 0);
      setHistoryTotalPages(data.totalPages ?? 0);
      setHistoryTotalElements(data.totalElements ?? 0);
      setHistoryFirst(data.first ?? true);
      setHistoryLast(data.last ?? true);
    } catch (err) {
      console.error("Error fetching history:", err);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(0, null);
  }, [fetchHistory]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const send = useCallback(async ({ targetType, title, body, currentVersion, deviceIds }) => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      let data;

      if (targetType === TARGET_TYPES.ALL) {
        data = await sendAllPush({ title, body });
      } else if (targetType === TARGET_TYPES.OUTDATED) {
        data = await sendOutdatedPush({ currentVersion, title, body });
      } else if (targetType === TARGET_TYPES.SELECT) {
        data = await sendSelectPush({ deviceIds, title, body });
      } else {
        throw new Error("Tipo de envío no válido");
      }

      setResult(data);
      fetchDevices();
      fetchHistory(0, historyFilter);
    } catch (err) {
      setError(err.message || "Error al enviar la notificación");
    } finally {
      setLoading(false);
    }
  }, [fetchDevices, fetchHistory, historyFilter]);

  const goToHistoryPage = useCallback((page) => {
    fetchHistory(page, historyFilter);
  }, [fetchHistory, historyFilter]);

  const applyHistoryFilter = useCallback((targetType) => {
    setHistoryFilter(targetType);
    fetchHistory(0, targetType);
  }, [fetchHistory]);

  return {
    loading,
    result,
    error,
    send,
    reset,
    devices,
    devicesLoading,
    fetchDevices,
    TARGET_TYPES,
    history,
    historyLoading,
    historyPage,
    historyTotalPages,
    historyTotalElements,
    historyFirst,
    historyLast,
    historyFilter,
    fetchHistory,
    goToHistoryPage,
    applyHistoryFilter,
  };
}

export { usePushNotifications, TARGET_TYPES };
