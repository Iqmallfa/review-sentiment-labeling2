import React from 'react';

const ROLES = [
  { role_name: 'admin', description: 'Mengelola user, mengassign data review ke validator, dan bisa ikut memvalidasi.' },
  { role_name: 'validator', description: 'Memvalidasi review yang sudah di-assign ke dirinya.' },
];

export default function RoleTab() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Daftar Role</h2>
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Deskripsi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ROLES.map((role) => (
              <tr key={role.role_name} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.role_name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{role.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}