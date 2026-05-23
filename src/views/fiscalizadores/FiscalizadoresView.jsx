import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import { useUsers } from "@/core/useUsers";
import { FiscalizadoresHeader } from "./components/FiscalizadoresHeader";
import { FiscalizadoresTable } from "./components/FiscalizadoresTable";

export function FiscalizadoresView() {
  const { showToast, currentUser } = useOutletContext();
  const { users, loading, fetchUsersFiscalizadores, toggleUserStatus } =
    useUsers();
  const [search, setSearch] = useState("");

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

  const filteredUsers = users.filter((u) =>
    (u.name + " " + u.lastname + " " + u.rut + " " + u.email)
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

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
      <FiscalizadoresHeader search={search} setSearch={setSearch} />

      <FiscalizadoresTable
        loading={loading}
        filteredUsers={filteredUsers}
        search={search}
        currentUser={currentUser}
      />
    </div>
  );
}
