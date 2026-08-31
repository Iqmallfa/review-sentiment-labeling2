import React, { useState } from 'react';
import { LogOut, Users, Shield, LayoutDashboard } from 'lucide-react';
import UserList from '../components/admin/UserList';
import RoleTab from '../components/admin/RoleTab';
import { Download } from 'lucide-react';
import api from '../api';

export default function AdminDashboard({ user, onLogout }) {

  const [activeTab, setActiveTab] = useState('users');
  const handleExport = async () => {
      try {
        const res = await api.get('/admin/export/reviews-validation', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'hasil_validasi_review.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error(err);
        alert('Gagal export data.');
      }
    };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-900">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mr-3">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
                Validasi<span className="text-blue-600">Admin</span>
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
              <span className="text-sm text-slate-500">
                Hi, <span className="font-medium text-slate-900">{user.username}</span>
              </span>
              <button
                onClick={onLogout}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-8 flex justify-center sm:justify-start">
          <nav className="flex space-x-2 bg-white p-1.5 rounded-xl shadow-sm border border-slate-100">
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users' ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-700/10' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              } rounded-lg px-5 py-2.5 text-sm font-medium flex items-center transition-all duration-200`}
            >
              <Users className="h-4 w-4 mr-2" /> Manajemen User
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`${
                activeTab === 'roles' ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-700/10' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              } rounded-lg px-5 py-2.5 text-sm font-medium flex items-center transition-all duration-200`}
            >
              <Shield className="h-4 w-4 mr-2" /> Role
            </button>
          </nav>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 min-h-[600px] overflow-hidden">
          {activeTab === 'users' ? <UserList /> : <RoleTab />}
        </div>
      </main>
    </div>
  );
}