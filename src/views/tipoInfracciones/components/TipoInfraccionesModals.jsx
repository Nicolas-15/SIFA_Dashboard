import { AlertTriangle, FileText, Calendar, Clock } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatDate, formatDateTime } from "@/utils/date";

export function TipoInfraccionesModals({
  isModalOpen,
  setIsModalOpen,
  isEditModalOpen,
  setIsEditModalOpen,
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  formData,
  setFormData,
  handleSubmit,
  handleEditSubmit,
  handleDeleteConfirm,
  submitting,
  selectedItem,
}) {
  const renderCreateFooter = (
    <div className="flex items-center justify-end gap-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsModalOpen(false)}
        className="px-5"
      >
        Cancelar
      </Button>
      <Button
        isLoading={submitting}
        loadingText="Guardando..."
        onClick={handleSubmit}
        className="!w-auto px-8"
      >
        Crear Tipo de Infracción
      </Button>
    </div>
  );

  const renderEditFooter = (
    <div className="flex items-center justify-end gap-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsEditModalOpen(false)}
        className="px-5"
      >
        Cancelar
      </Button>
      <Button
        isLoading={submitting}
        loadingText="Guardando..."
        onClick={handleEditSubmit}
        className="!w-auto px-8"
      >
        Guardar Cambios
      </Button>
    </div>
  );

  const renderDeleteFooter = (
    <div className="flex items-center justify-end gap-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsDeleteModalOpen(false)}
        className="px-5"
      >
        Cancelar
      </Button>
      <Button
        isLoading={submitting}
        loadingText="Eliminando..."
        variant="danger"
        onClick={handleDeleteConfirm}
        className="!w-auto px-8"
      >
        Eliminar
      </Button>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Nuevo Tipo de Infracción"
        description="Completa los datos del nuevo tipo de infracción."
        footer={renderCreateFooter}
      >
        <div className="space-y-6">
          <Input
            label="Nombre"
            icon={AlertTriangle}
            required
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            placeholder="Ej: Exceso de velocidad"
          />
          <Input
            label="Descripción"
            icon={FileText}
            value={formData.descripcion}
            onChange={(e) =>
              setFormData({ ...formData, descripcion: e.target.value })
            }
            placeholder="Descripción detallada del tipo de infracción"
          />
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Tipo de Infracción"
        description={`Modificando: ${selectedItem?.nombre}`}
        footer={renderEditFooter}
      >
        <div className="space-y-6">
          <Input
            label="Nombre"
            icon={AlertTriangle}
            required
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
          />
          <Input
            label="Descripción"
            icon={FileText}
            value={formData.descripcion}
            onChange={(e) =>
              setFormData({ ...formData, descripcion: e.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fecha de creación"
              icon={Calendar}
              value={formatDate(selectedItem?.createdAt)?.date || '-'}
              disabled
              className="bg-slate-50"
            />
            <Input
              label="Última modificación"
              icon={Clock}
              value={formatDateTime(selectedItem?.updatedAt)}
              disabled
              className="bg-slate-50"
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Eliminar Tipo de Infracción"
        description={`¿Estás seguro de eliminar "${selectedItem?.nombre}"? Esta acción no se puede deshacer.`}
        footer={renderDeleteFooter}
      >
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-sm text-red-700 font-medium">
            El tipo de infracción será eliminado permanentemente del sistema.
          </p>
        </div>
      </Modal>
    </>
  );
}