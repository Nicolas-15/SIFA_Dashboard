import { useState, useEffect } from 'react';
import { Search, Plus, User, CheckCircle2, XCircle, Edit2 } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

import { SYSTEM_ROLES } from '../../utils/constants';
import * as userService from '../../services/user.service';
import { UserModals } from './UserModals';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';

export function UserManagementView() {
  const { showToast, currentUser } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '', lastname: '', rut: '', email: '', phone: '', password: '', confirmPassword: '',
    role: SYSTEM_ROLES.DEFAULT, status: 'active'
  });

  const fetchUsers = async () => {
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
      showToast('No se pudieron cargar los usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRutChange = (e) => {
    let value = e.target.value.replace(/[^0-9kK]/g, '').toUpperCase();
    if (value.length <= 1) { setFormData({ ...formData, rut: value }); return; }
    let body = value.slice(0, -1).replace(/K/g, '');
    let dv = value.slice(-1);
    body = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    setFormData({ ...formData, rut: `${body}-${dv}` });
  };

  const handlePhoneChange = (e) => {
    let val = e.target.value;
    if (!val.startsWith('+569')) val = '+569' + val.replace(/[^\d]/g, '');
    if (val.length > 12) val = val.slice(0, 12);
    setFormData({ ...formData, phone: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!/^\d{1,2}\.\d{3}\.\d{3}-[0-9K]$/.test(formData.rut)) {
      showToast('El formato del RUT no es válido', 'error');
      setSubmitting(false); return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Las contraseñas no coinciden', 'error');
      setSubmitting(false); return;
    }

    try {
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

      console.log(`[DEBUG] Creando usuario con rol: ${backendRole}`);
      await userService.createUser(payload);
      
      showToast('Usuario creado exitosamente', 'success');
      setIsModalOpen(false);
      setFormData({ name: '', lastname: '', rut: '', email: '', phone: '', password: '', confirmPassword: '', role: SYSTEM_ROLES.DEFAULT, status: 'active' });
      fetchUsers();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name, lastname: user.lastname, rut: user.rut, email: user.email, phone: user.phone,
      password: '', confirmPassword: '', role: user.role, status: user.status
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const rutSinPuntos = formData.rut.split('-')[0].replace(/\./g, '');
      const payload = { name: formData.name, lastName: formData.lastname, email: formData.email, phone: formData.phone };
      if (formData.password) {
        if (formData.password !== formData.confirmPassword) {
          showToast('Las contraseñas no coinciden', 'error');
          setSubmitting(false); return;
        }
        payload.password = formData.password;
      }
      await userService.updateUser(rutSinPuntos, payload);
      if (formData.role !== selectedUser.role) {
        let backendRole = 'USER_JPL'; // Usuario base como Administrativo JPL
        if (formData.role === SYSTEM_ROLES.ADMIN) backendRole = 'USER_ADMIN';
        else if (formData.role === SYSTEM_ROLES.SUPERVISOR) backendRole = 'USER_SUPERVISOR';

        await userService.updateUserRole(rutSinPuntos, backendRole);
      }
      showToast('Usuario actualizado exitosamente', 'success');
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      if (currentStatus === 'active') {
        await userService.revokeUser(id);
        showToast('Usuario revocado exitosamente', 'success');
      } else {
        await userService.activateUser(id);
        showToast('Usuario activado exitosamente', 'success');
      }
      fetchUsers();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const filteredUsers = users.filter(u =>
    (u.name + ' ' + u.lastname + ' ' + u.rut + ' ' + u.email).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Gestión de Usuarios</h2>
          <p className="text-sm text-slate-500">Administra los accesos y roles del sistema.</p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Buscar usuario..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={Search}
            className="w-64 !py-2"
          />
          <Button onClick={() => {
            setFormData({
              name: '', lastname: '', rut: '', email: '', phone: '',
              password: '', confirmPassword: '', role: SYSTEM_ROLES.DEFAULT, status: 'active'
            });
            setIsModalOpen(true);
          }} className="!w-auto px-4 !py-2.5">
            <Plus size={18} /> Nuevo Usuario
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-sm">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">RUT</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Creado el</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-24 text-center text-slate-400">Cargando usuarios reales...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <EmptyState query={search} />
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <User size={18} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{user.name} {user.lastname}</p>
                          <p className="text-[11px] text-slate-500 font-mono">ID: {user.id.split('-')[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{user.rut}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">{user.email}</p>
                      <p className="text-xs text-slate-400">{user.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${user.role === SYSTEM_ROLES.ADMIN ? 'bg-purple-100 text-purple-700' :
                        user.role === SYSTEM_ROLES.SUPERVISOR ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                        }`}>{user.role}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-mono">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Pendiente'}</td>
                    <td className="px-6 py-4">
                      {user.status === 'active' ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm"><CheckCircle2 size={16} /> Activo</div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-500 font-bold text-sm"><XCircle size={16} /> Revocado</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => toggleStatus(user.id, user.status)}
                          disabled={user.email === currentUser?.email}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${user.status === 'active'
                            ? (user.email === currentUser?.email ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-amber-50 text-amber-600 hover:bg-amber-100')
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}
                        >{user.status === 'active' ? 'Revocar' : 'Activar'}</button>
                        <button onClick={() => handleEditClick(user)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"><Edit2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserModals
        isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}
        isEditModalOpen={isEditModalOpen} setIsEditModalOpen={setIsEditModalOpen}
        formData={formData} setFormData={setFormData}
        handleRutChange={handleRutChange} handlePhoneChange={handlePhoneChange}
        handleSubmit={handleSubmit} handleEditSubmit={handleEditSubmit}
        submitting={submitting} selectedUser={selectedUser}
      />
    </div>
  );
}
