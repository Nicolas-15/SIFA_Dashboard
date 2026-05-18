import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import { useTipoInfracciones } from "@/core/useTipoInfracciones";
import { TipoInfraccionesHeader } from "./components/TipoInfraccionesHeader";
import { TipoInfraccionesTable } from "./components/TipoInfraccionesTable";
import { TipoInfraccionesModals } from "./components/TipoInfraccionesModals";

export function TipoInfraccionesView() {
  const { showToast, currentUser } = useOutletContext();
  const {
    tipoInfracciones,
    loading,
    fetchTipoInfracciones,
    createTipoInfraccion,
    updateTipoInfraccion,
    deleteTipoInfraccion,
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

  useEffect(() => {
    if (currentUser) {
      fetchTipoInfracciones().catch((err) => {
        const isAuthError =
          err.message.includes("401") ||
          err.message.includes("403") ||
          err.message.includes("Unauthorized") ||
          err.message.includes("Forbidden");

        if (!isAuthError) {
          showToast("No se pudieron cargar los tipos de infracciones", "error");
        }
      });
    }
  }, [fetchTipoInfracciones, currentUser, showToast]);

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
      />

      <TipoInfraccionesTable
        loading={loading}
        filteredTipoInfracciones={filteredItems}
        search={search}
        handleEditClick={handleEditClick}
        handleDeleteClick={handleDeleteClick}
      />

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