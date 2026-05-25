import { useState } from "react";
import { useOutletContext } from "react-router-dom";

import { useTipoInfracciones } from "@/core/useTipoInfracciones";
import { SYSTEM_ROLES } from "@/constants/roles";
import { TipoInfraccionesHeader } from "./components/TipoInfraccionesHeader";
import { TipoInfraccionesTable } from "./components/TipoInfraccionesTable";
import { TipoInfraccionesModals } from "./components/TipoInfraccionesModals";
import { TableCard } from "@/components/ui/TableCard";

export function TipoInfraccionesView() {
  const { showToast, currentUser } = useOutletContext();
  const isAdmin = currentUser?.role === SYSTEM_ROLES.ADMIN;
  const {
    tipoInfracciones,
    loading,
    error,
    createTipoInfraccion,
    updateTipoInfraccion,
    deleteTipoInfraccion,
    page,
    totalPages,
    totalElements,
    first,
    last,
    goToPage,
  } = useTipoInfracciones();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  });

  const handleNewClick = () => {
    setFormData({
      nombre: "",
      descripcion: "",
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setFormData({
      nombre: item.nombre,
      descripcion: item.descripcion || "",
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!formData.nombre.trim()) {
      showToast("El nombre es requerido", "error");
      setSubmitting(false);
      return;
    }

    try {
      await createTipoInfraccion(formData);
      showToast("Tipo de infracción creado exitosamente", "success");
      setIsModalOpen(false);
      setFormData({
        nombre: "",
        descripcion: "",
      });
    } catch (err) {
      showToast(err.message || "Error al crear tipo de infracción", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!formData.nombre.trim()) {
      showToast("El nombre es requerido", "error");
      setSubmitting(false);
      return;
    }

    try {
      await updateTipoInfraccion(selectedItem.id, formData);
      showToast("Tipo de infracción actualizado exitosamente", "success");
      setIsEditModalOpen(false);
    } catch (err) {
      showToast(err.message || "Error al actualizar tipo de infracción", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setSubmitting(true);
    try {
      await deleteTipoInfraccion(selectedItem.id);
      showToast("Tipo de infracción eliminado exitosamente", "success");
      setIsDeleteModalOpen(false);
    } catch (err) {
      showToast(err.message || "Error al eliminar tipo de infracción", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = tipoInfracciones.filter((item) =>
    (item.nombre + " " + (item.descripcion || ""))
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full space-y-6">
      <TipoInfraccionesHeader
        search={search}
        setSearch={setSearch}
        onNew={handleNewClick}
        isAdmin={isAdmin}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          No se pudieron cargar los tipos de infracciones.
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
        <TipoInfraccionesTable
          loading={loading}
          filteredTipoInfracciones={filteredItems}
          search={search}
          handleEditClick={handleEditClick}
          handleDeleteClick={handleDeleteClick}
          isAdmin={isAdmin}
        />
      </TableCard>

      <TipoInfraccionesModals
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        isDeleteModalOpen={isDeleteModalOpen}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        handleEditSubmit={handleEditSubmit}
        handleDeleteConfirm={handleDeleteConfirm}
        submitting={submitting}
        selectedItem={selectedItem}
      />
    </div>
  );
}