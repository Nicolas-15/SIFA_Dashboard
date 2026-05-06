import { useState, useCallback } from 'react';
import { SYSTEM_ROLES } from '@/constants/roles';
import * as userService from '@/services/user.service';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      const usersList = Array.isArray(data) ? data : [];
      const mappedUsers = usersList.map(user => {
        let mappedRole = SYSTEM_ROLES.DEFAULT;
        if (user.role === 'USER_ADMIN') mappedRole = SYSTEM_ROLES.ADMIN;
        else if (user.role === 'USER_SUPERVISOR') mappedRole = SYSTEM_ROLES.SUPERVISOR;

        return {
          id: user.rut,
          name: user.name,
          lastname: user.lastName,
          rut: `${user.rut}-${user.dv}`,
          email: user.email,
          phone: user.phone || '+569',
          role: mappedRole,
          status: (user.active || user.isActive) ? 'active' : 'revoked',
          createdAt: user.createdAt
        };
      });
      setUsers(mappedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      throw new Error('No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = async (formData) => {
    const rutSinPuntos = formData.rut.replace(/\./g, '');
    const [rutBody, dv] = rutSinPuntos.split('-');

    let backendRole = 'USER_JPL';
    if (formData.role === SYSTEM_ROLES.ADMIN) backendRole = 'USER_ADMIN';
    else if (formData.role === SYSTEM_ROLES.SUPERVISOR) backendRole = 'USER_SUPERVISOR';

    const payload = {
      rut: rutBody, dv, name: formData.name, lastName: formData.lastname,
      birthDate: '1990-01-01', email: formData.email, phone: formData.phone,
      password: formData.password, role: backendRole
    };

    await userService.createUser(payload);
    await fetchUsers(); // Refrescar lista
  };

  const updateUser = async (selectedUser, formData) => {
    const rutSinPuntos = formData.rut.split('-')[0].replace(/\./g, '');
    const payload = { name: formData.name, lastName: formData.lastname, email: formData.email, phone: formData.phone };
    
    if (formData.password) {
      payload.password = formData.password;
    }
    
    await userService.updateUser(rutSinPuntos, payload);
    
    if (formData.role !== selectedUser.role) {
      let backendRole = 'USER_JPL';
      if (formData.role === SYSTEM_ROLES.ADMIN) backendRole = 'USER_ADMIN';
      else if (formData.role === SYSTEM_ROLES.SUPERVISOR) backendRole = 'USER_SUPERVISOR';
      await userService.updateUserRole(rutSinPuntos, backendRole);
    }
    
    await fetchUsers(); // Refrescar lista
  };

  const toggleUserStatus = async (id, currentStatus) => {
    if (currentStatus === 'active') {
      await userService.revokeUser(id);
    } else {
      await userService.activateUser(id);
    }
    await fetchUsers(); // Refrescar lista
  };

  return {
    users,
    loading,
    fetchUsers,
    createUser,
    updateUser,
    toggleUserStatus
  };
};
