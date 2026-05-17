import { useState, useEffect, useCallback } from 'react';
import { getInfractions, updateInfractionStatus, updateInfractionData } from '@/services/infractions.service';
import { useAuth } from './AuthContext';

export const useInfractions = () => {
  const [infractions, setInfractions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchInfractions = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(false);
    try {
      const data = await getInfractions();
      
      const normalizeStatus = (s) => ({
        'en proceso': 'pending', 'en_proceso': 'pending', 'pendiente': 'pending', 'pending': 'pending',
        'aprobada': 'accepted', 'aceptada': 'accepted', 'aprobado': 'accepted', 'aceptado': 'accepted', 'accepted': 'accepted',
        'rechazada': 'rejected', 'rechazado': 'rejected', 'rejected': 'rejected',
        'exportada': 'exported', 'exportado': 'exported', 'exported': 'exported'
      })[s?.toLowerCase()] || 'pending';

      const normalized = (data || []).map(inf => ({
        ...inf,
        status: normalizeStatus(inf.status)
      }));

      setInfractions(normalized);
    } catch (err) {
      console.error('Error fetching infractions:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchInfractions();
  }, [fetchInfractions]);

  const updateStatus = async (id, newStatus) => {
    // Actualización optimista
    setInfractions(prev =>
      prev.map(inf => inf.id === id ? { ...inf, status: newStatus } : inf)
    );
    try {
      await updateInfractionStatus(id, newStatus);
      return true;
    } catch (err) {
      console.error('Error al persistir estado en la API:', err);
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

  return { infractions, loading, error, fetchInfractions, updateStatus, saveInfractionEdit };
};
