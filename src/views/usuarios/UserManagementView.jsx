import { useState } from "react";
import { useOutletContext } from "react-router-dom";

import { SYSTEM_ROLES } from "@/constants/roles";
import { useUsers } from "@/core/useUsers";
import { UsersHeader } from "./components/UsersHeader";
import { UsersTable } from "./components/UsersTable";
import { UserModals } from "./components/UserModals";
import { TableCard } from "@/components/ui/TableCard";

export function UserManagementView() {
  const { showToast, currentUser } = useOutletContext();
  const {
    users,
    loading,
    error,
    createUser,
    updateUser,
    toggleUserStatus,
    page,
    totalPages,
    totalElements,
    first,
    last,
    goToPage,
  } = useUsers();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    rut: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: SYSTEM_ROLES.DEFAULT,
    status: "active",
  });

  const handleRutChange = (e) => {
    let value = e.target.value.replace(/[^0-9kK]/g, "").toUpperCase();
    if (value.length <= 1) {
      setFormData({ ...formData, rut: value });
      return;
    }
    let body = value.slice(0, -1).replace(/K/g, "");
    let dv = value.slice(-1);
    body = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setFormData({ ...formData, rut: `${body}-${dv}` });
  };

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/[^\d]/g, "");
    if (val.length > 8) val = val.slice(0, 8);
    setFormData({ ...formData, phone: val });
  };

  const handleNewUserClick = () => {
    setFormData({
      name: "",
      lastname: "",
      rut: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: SYSTEM_ROLES.DEFAULT,
      status: "active",
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      lastname: user.lastname,
      rut: user.rut,
      email: user.email,
      phone: user.phone.slice(4),
      password: "",
      confirmPassword: "",
      role: user.role,
      status: user.status,
    });
    setIsEditModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!/^\d{1,2}\.\d{3}\.\d{3}-[0-9K]$/.test(formData.rut)) {
      showToast("El formato del RUT no es válido", "error");
      setSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast("Las contraseñas no coinciden", "error");
      setSubmitting(false);
      return;
    }

    try {
      await createUser(formData);
      showToast("Usuario creado exitosamente", "success");
      setIsModalOpen(false);
      setFormData({
        name: "",
        lastname: "",
        rut: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: SYSTEM_ROLES.DEFAULT,
        status: "active",
      });
    } catch (err) {
      showToast(err.message || "Error al crear usuario", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (formData.password && formData.password !== formData.confirmPassword) {
      showToast("Las contraseñas no coinciden", "error");
      setSubmitting(false);
      return;
    }

    try {
      await updateUser(selectedUser, formData);
      showToast("Usuario actualizado exitosamente", "success");
      setIsEditModalOpen(false);
    } catch (err) {
      showToast(err.message || "Error al actualizar usuario", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await toggleUserStatus(id, currentStatus);
      showToast(
        `Usuario ${currentStatus === "active" ? "revocado" : "activado"} exitosamente`,
        "success",
      );
    } catch (err) {
      showToast(err.message || "Error al cambiar estado", "error");
    }
  };

  const filteredUsers = users.filter((u) =>
    (u.name + " " + u.lastname + " " + u.rut + " " + u.email)
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full space-y-6">
      <UsersHeader
        search={search}
        setSearch={setSearch}
        onNewUser={handleNewUserClick}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          No se pudieron cargar los usuarios.
        </div>
      )}

      <TableCard
        totalElements={totalElements}
        totalPages={totalPages}
        page={page}
        first={first}
        last={last}
        loading={loading}
        onPageChange={goToPage}
      >
        <UsersTable
          loading={loading}
          filteredUsers={filteredUsers}
          search={search}
          currentUser={currentUser}
          toggleStatus={toggleStatus}
          handleEditClick={handleEditClick}
        />
      </TableCard>

      <UserModals
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        formData={formData}
        setFormData={setFormData}
        handleRutChange={handleRutChange}
        handlePhoneChange={handlePhoneChange}
        handleSubmit={handleSubmit}
        handleEditSubmit={handleEditSubmit}
        submitting={submitting}
        selectedUser={selectedUser}
      />
    </div>
  );
}
