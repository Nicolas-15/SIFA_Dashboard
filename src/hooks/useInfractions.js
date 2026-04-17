import { useState, useEffect, useCallback } from 'react';
import { getInfractions, updateInfractionStatus } from '../services/infractions.service';
import { useAuth } from '../contexts/AuthContext';

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
      setInfractions(data);
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
      return true; // Exito
    } catch (err) {
      console.error('Error al persistir estado en la API:', err);
      // Revertir estado si el usuario quisiera manejar el error aquí (opcional)
      return false; // Error
    }
  };

  const updateInfractionLocal = (id, updatedFields) => {
    setInfractions(prev =>
      prev.map(inf => inf.id === id ? { ...inf, ...updatedFields } : inf)
    );
  };

  return {
    infractions,
    loading,
    error,
    fetchInfractions,
    updateStatus,
    updateInfractionLocal
  };
};
