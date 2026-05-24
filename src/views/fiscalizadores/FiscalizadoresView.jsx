import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import { useUsers } from "@/core/useUsers";
import { FiscalizadoresFilters } from "./components/FiscalizadoresFilters";
import { FiscalizadoresTable } from "./components/FiscalizadoresTable";

export function FiscalizadoresView() {
  const { showToast, currentUser } = useOutletContext();
  const { users, loading, fetchUsersFiscalizadores, toggleUserStatus } =
    useUsers();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  useEffect(() => {
    if (currentUser) {
      fetchUsersFiscalizadores().catch((err) => {
        // Detener el bucle si es 401 (No autorizado) o 403 (Prohibido)
        const isAuthError =
          err.message.includes("401") ||
          err.message.includes("403") ||
          err.message.includes("Unauthorized") ||
          err.message.includes("Forbidden");

        if (!isAuthError) {
          showToast("No se pudieron cargar los usuarios", "error");
        }
      });
    }
  }, [fetchUsersFiscalizadores, currentUser, showToast]);

  const filteredUsers = users.filter((u) => {
    // Filtro por búsqueda de texto
    const matchesSearch = (
      u.name +
      " " +
      u.lastname +
      " " +
      u.rut +
      " " +
      u.email
    )
      .toLowerCase()
      .includes(search.toLowerCase());

    // Filtro por estado
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;

    // Filtro por rango de fechas
    let matchesDate = true;
    if (dateRange.startDate || dateRange.endDate) {
      const userDate = u.createdAt ? new Date(u.createdAt) : null;
      if (userDate) {
        if (dateRange.startDate) {
          const start = new Date(dateRange.startDate);
          start.setHours(0, 0, 0, 0);
          matchesDate = userDate >= start;
        }
        if (matchesDate && dateRange.endDate) {
          const end = new Date(dateRange.endDate);
          end.setHours(23, 59, 59, 999);
          matchesDate = userDate <= end;
        }
      } else {
        matchesDate = false;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await toggleUserStatus(id, currentStatus);
      showToast(
        `Fiscalizador ${currentStatus === "active" ? "revocado" : "activado"} exitosamente`,
        "success",
      );
    } catch (err) {
      showToast(err.message || "Error al cambiar estado", "error");
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-800">
          Usuarios Fiscalizadores
        </h2>
        <p className="text-sm text-slate-500">
          Lista de personal autorizado para fiscalización en terreno.
        </p>
      </div>

      <FiscalizadoresFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        users={users}
      />

      <FiscalizadoresTable
        loading={loading}
        filteredUsers={filteredUsers}
        search={search}
        currentUser={currentUser}
        toggleStatus={handleToggleStatus}
      />
    </div>
  );
}
