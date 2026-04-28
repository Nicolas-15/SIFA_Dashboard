import { User, Mail, Phone, Lock, Shield, CreditCard } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { SYSTEM_ROLES } from '../../utils/constants';

export function UserModals({
  isModalOpen,
  setIsModalOpen,
  isEditModalOpen,
  setIsEditModalOpen,
  formData,
  setFormData,
  handleRutChange,
  handlePhoneChange,
  handleSubmit,
  handleEditSubmit,
  submitting,
  selectedUser
}) {

  const renderCreateFooter = (
    <div className="flex items-center justify-end gap-3">
      <button
        onClick={() => setIsModalOpen(false)}
        className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        Cancelar
      </button>
      <Button
        isLoading={submitting}
        loadingText="Guardando..."
        onClick={handleSubmit}
        className="!w-auto px-8"
      >
        Crear Usuario
      </Button>
    </div>
  );

  const renderEditFooter = (
    <div className="flex items-center justify-end gap-3">
      <button
        onClick={() => setIsEditModalOpen(false)}
        className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        Cancelar
      </button>
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

  return (
    <>
      {/* Modal de Creación */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Nuevo Usuario"
        description="Completa los datos del nuevo funcionario."
        footer={renderCreateFooter}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-5">
            <Input
              label="Nombres"
              icon={User}
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Juan"
            />
            <Input
              label="Apellidos"
              required
              value={formData.lastname}
              onChange={e => setFormData({ ...formData, lastname: e.target.value })}
              placeholder="Pérez"
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Input
              label="RUT (Chileno)"
              icon={CreditCard}
              required
              value={formData.rut}
              onChange={handleRutChange}
              maxLength={12}
              placeholder="12.345.678-9"
              className="font-mono"
            />
            <Input
              label="Teléfono (+569)"
              icon={Phone}
              required
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="+56912345678"
              className="font-mono"
            />
          </div>

          <Input
            label="Correo Institucional"
            icon={Mail}
            type="email"
            required
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            placeholder="correo@elquisco.cl"
          />

          <div className="grid grid-cols-2 gap-5">
            <Input
              label="Contraseña"
              icon={Lock}
              type="password"
              minLength={6}
              required
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
            />
            <Input
              label="Confirmar Clave"
              icon={Lock}
              type="password"
              minLength={6}
              required
              value={formData.confirmPassword}
              onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••"
            />
          </div>
        </div>
      </Modal>

      {/* Modal de Edición */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Usuario"
        description={`Modificando a: ${selectedUser?.rut}`}
        footer={renderEditFooter}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-5">
            <Input
              label="Nombres"
              icon={User}
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Apellidos"
              required
              value={formData.lastname}
              onChange={e => setFormData({ ...formData, lastname: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Input
              label="Teléfono"
              icon={Phone}
              value={formData.phone}
              onChange={handlePhoneChange}
              className="font-mono"
            />
            <div>
              <label className="block text-xs font-semibold mb-2 ml-1 text-slate-600">Rol en el Sistema</label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                >
                  {Object.values(SYSTEM_ROLES).map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <Input
            label="Correo Institucional"
            icon={Mail}
            type="email"
            required
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />

          <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 space-y-4">
            <p className="text-[11px] font-black text-amber-700 uppercase tracking-widest">Cambiar Contraseña (Opcional)</p>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nueva Clave"
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="bg-white"
              />
              <Input
                label="Confirmar"
                type="password"
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="bg-white"
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
