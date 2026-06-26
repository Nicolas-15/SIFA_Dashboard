import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import { SYSTEM_ROLES } from "@/constants/roles";
import * as userService from "@/services/user.service";

const normalizeUser = (user) => {
  let mappedRole = SYSTEM_ROLES.DEFAULT;
  if (user.role === "USER_ADMIN" || user.role === "ADMIN")
    mappedRole = SYSTEM_ROLES.ADMIN;
  else if (user.role === "USER_SUPERVISOR" || user.role === "SUPERVISOR")
    mappedRole = SYSTEM_ROLES.SUPERVISOR;
  else if (user.role === "USER_APP") mappedRole = SYSTEM_ROLES.USER_APP;

  return {
    id: user.rut,
    name: user.name,
    lastname: user.lastName,
    rut: `${user.rut}-${user.dv}`,
    email: user.email,
    phone: user.phone || "+569",
    role: mappedRole,
    status: user.active || user.isActive ? "active" : "revoked",
    createdAt: user.createdAt,
  };
};

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [first, setFirst] = useState(true);
  const [last, setLast] = useState(true);
  const [size] = useState(10);

  const [searchQuery, setSearchQuery] = useState("");

  const { isAuthenticated } = useAuth();

  const latestParams = useRef({ page: 0, searchQuery: "" });
  latestParams.current = { page, searchQuery };

  const doFetch = useCallback(async (overrides) => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(false);

    try {
      const p = overrides || latestParams.current;
      const data = await userService.getUsers({ page: p.page, size, search: p.searchQuery || undefined });

      const list = Array.isArray(data.content) ? data.content : [];
      setUsers(list.map(normalizeUser));
      setTotalPages(data.totalPages ?? 0);
      setTotalElements(data.totalElements ?? 0);
      setFirst(data.first ?? true);
      setLast(data.last ?? true);

      if (data.number !== undefined && data.number !== p.page) {
        setPage(data.number);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, size]);

  useEffect(() => {
    doFetch();
  }, [page, searchQuery, doFetch]);

  const goToPage = useCallback((p) => setPage(p), []);

  const updateSearchQuery = useCallback((query) => {
    setSearchQuery(query);
    setPage(0);
  }, []);

  const fetchUsersFiscalizadores = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await userService.getUsersFiscalizadores();
      const usersList = Array.isArray(data) ? data : [];
      setUsers(usersList.map(normalizeUser));
      setTotalPages(0);
      setTotalElements(0);
    } catch (err) {
      console.error("Error fetching users fiscalizadores:", err);
      setUsers([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = async (formData) => {
    const rutSinPuntos = formData.rut.replace(/\./g, "");
    const [rutBody, dv] = rutSinPuntos.split("-");

    let backendRole = "USER_JPL";
    if (formData.role === SYSTEM_ROLES.ADMIN) backendRole = "USER_ADMIN";
    else if (formData.role === SYSTEM_ROLES.SUPERVISOR)
      backendRole = "USER_SUPERVISOR";
    else if (formData.role === SYSTEM_ROLES.USER_APP) backendRole = "USER_APP";

    const payload = {
      rut: rutBody,
      dv,
      name: formData.name,
      lastName: formData.lastname,
      birthDate: "1990-01-01",
      email: formData.email,
      phone: formData.phone ? `+569${formData.phone}` : "",
      password: formData.password,
      role: backendRole,
    };

    await userService.createUser(payload);
    await doFetch({ page: 0 });
  };

  const updateUser = async (selectedUser, formData) => {
    const rutSinPuntos = formData.rut.split("-")[0].replace(/\./g, "");
    const payload = {
      name: formData.name,
      lastName: formData.lastname,
      email: formData.email,
      phone: formData.phone ? `+569${formData.phone}` : "",
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    await userService.updateUser(rutSinPuntos, payload);

    if (formData.role !== selectedUser.role) {
      let backendRole = "USER_JPL";
      if (formData.role === SYSTEM_ROLES.ADMIN) backendRole = "USER_ADMIN";
      else if (formData.role === SYSTEM_ROLES.SUPERVISOR)
        backendRole = "USER_SUPERVISOR";
      else if (formData.role === SYSTEM_ROLES.USER_APP)
        backendRole = "USER_APP";
      await userService.updateUserRole(rutSinPuntos, backendRole);
    }

    await doFetch({ page });
  };

  const toggleUserStatus = async (id, currentStatus) => {
    if (currentStatus === "active") {
      await userService.revokeUser(id);
    } else {
      await userService.activateUser(id);
    }
    await doFetch({ page });
  };

  return {
    users,
    loading,
    error,
    fetchUsers: doFetch,
    fetchUsersFiscalizadores,
    createUser,
    updateUser,
    toggleUserStatus,
    page,
    totalPages,
    totalElements,
    first,
    last,
    goToPage,
    searchQuery,
    setSearchQuery: updateSearchQuery,
  };
};