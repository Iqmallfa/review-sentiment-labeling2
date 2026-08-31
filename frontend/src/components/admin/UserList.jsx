import React, { useState, useEffect, useMemo } from 'react';
import { Pencil, Plus, Loader2, UserPlus2, UserX, UserCheck, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import api from '../../api';
import AssignModal from './AssignModal';
import ManageAssignmentModal from './ManageAssignmentModal';

function getProgressPercentage(user) {
  // null = tidak punya progress yang bisa dibandingkan (admin, atau validator tanpa tugas)
  if (user.role !== 'validator' || user.total_assigned === 0) return null;
  return user.total_validated / user.total_assigned;
}

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', role: 'validator', requiresPassword: false, password: '' });
  const [formError, setFormError] = useState('');

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [managingUser, setManagingUser] = useState(null);

  // null = urutan asli, 'asc' = progress kecil dulu, 'desc' = progress besar dulu
  const [sortDirection, setSortDirection] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const sortedUsers = useMemo(() => {
    if (!sortDirection) return users;

    const withProgress = users.filter((u) => getProgressPercentage(u) !== null);
    const withoutProgress = users.filter((u) => getProgressPercentage(u) === null);

    withProgress.sort((a, b) => {
      const diff = getProgressPercentage(a) - getProgressPercentage(b);
      return sortDirection === 'asc' ? diff : -diff;
    });

    // User tanpa progress (admin, atau validator 0 tugas) selalu di bawah
    return [...withProgress, ...withoutProgress];
  }, [users, sortDirection]);

  const handleSortProgress = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'));
  };

  const handleOpenModal = (user = null) => {
    setFormError('');
    if (user) {
      setEditingUser(user);
      setFormData({ username: user.username, role: user.role, requiresPassword: user.requires_password, password: '' });
    } else {
      setEditingUser(null);
      setFormData({ username: '', role: 'validator', requiresPassword: false, password: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const payload = {
        username: formData.username,
        role: formData.role,
        requires_password: formData.requiresPassword,
      };
      if (formData.password) payload.password = formData.password;

      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}`, payload);
      } else {
        await api.post('/admin/users', payload);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Terjadi kesalahan.');
    }
  };

  const handleToggleStatus = async (user) => {
    if (!window.confirm(`${user.is_active ? 'Nonaktifkan' : 'Aktifkan'} user "${user.username}"?`)) return;
    try {
      await api.put(`/admin/users/${user.id}/toggle-status`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Gagal mengubah status.');
    }
  };

  const validators = users.filter((u) => u.role === 'validator');

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Manajemen User</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAssignModalOpen(true)}
            disabled={validators.length === 0}
            className="bg-orange-50 text-orange-600 hover:bg-orange-100 px-4 py-2 rounded-lg flex items-center transition-colors text-sm font-medium disabled:opacity-50"
          >
            <UserPlus2 className="w-4 h-4 mr-2" /> Assign Data
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-sm text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" /> Tambah User
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <button
                  onClick={handleSortProgress}
                  className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                  title="Klik untuk urutkan berdasarkan progress"
                >
                  Progress
                  {sortDirection === 'asc' && <ArrowUp className="w-3 h-3" />}
                  {sortDirection === 'desc' && <ArrowDown className="w-3 h-3" />}
                  {!sortDirection && <ArrowUpDown className="w-3 h-3 text-gray-300" />}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">@{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {user.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.requires_password ? 'bg-slate-100 text-slate-700' : 'bg-gray-50 text-gray-400'
                  }`}>
                    {user.requires_password ? 'Wajib' : 'Tanpa Password'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.role === 'validator' ? (
                    <div className="flex flex-col w-32">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>{user.total_validated}</span>
                        <span>dari {user.total_assigned}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 border border-slate-200 overflow-hidden">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${user.total_assigned > 0 ? (user.total_validated / user.total_assigned) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenModal(user)} className="inline-flex items-center px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-medium">
                      <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                        user.is_active ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      }`}
                    >
                      {user.is_active ? <UserX className="w-3.5 h-3.5 mr-1" /> : <UserCheck className="w-3.5 h-3.5 mr-1" />}
                      {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    {user.role === 'validator' && (
                      <button
                        onClick={() => setManagingUser(user)}
                        className="inline-flex items-center px-2.5 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-medium"
                      >
                        Kelola Tugas
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Belum ada data user</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold mb-4">{editingUser ? 'Edit User' : 'Tambah User Baru'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text" required
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="validator">validator</option>
                  <option value="admin">admin</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requiresPassword"
                  checked={formData.requiresPassword}
                  onChange={(e) => setFormData({ ...formData, requiresPassword: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="requiresPassword" className="text-sm font-medium text-gray-700">
                  Wajibkan Password untuk login
                </label>
              </div>

              {formData.requiresPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {editingUser && <span className="text-xs text-gray-400 font-normal">(kosongkan jika tidak ganti)</span>}
                  </label>
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="********"
                  />
                </div>
              )}

              {formError && <div className="bg-red-50 text-red-600 p-2.5 rounded-lg text-sm">{formError}</div>}
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAssignModalOpen && (
        <AssignModal
          validators={validators}
          onClose={() => setIsAssignModalOpen(false)}
          onSuccess={(result) => {
            setIsAssignModalOpen(false);
            fetchUsers();
            alert(`Berhasil assign ${result.assigned_count} review.`);
          }}
        />
      )}

      {managingUser && (
        <ManageAssignmentModal
          user={managingUser}
          otherValidators={validators.filter((v) => v.id !== managingUser.id)}
          onClose={() => setManagingUser(null)}
          onSuccess={(message) => {
            setManagingUser(null);
            fetchUsers();
            alert(message);
          }}
        />
      )}
    </div>
  );
}
