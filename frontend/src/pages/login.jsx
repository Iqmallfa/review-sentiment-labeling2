import React, { useState } from 'react';
import api from '../api';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // step 1 = input username, step 2 = input password
  const [step, setStep] = useState(1);

  const handleCheckUsername = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/check-username', { username });
      if (response.data.requires_password) {
        setStep(2);
      } else {
        await performLogin(username, '');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Username tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  };

  const performLogin = async (user, pass) => {
    const payload = { username: user };
    if (pass) payload.password = pass;

    const response = await api.post('/auth/login', payload);
    const userData = {
      username: user,
      access_token: response.data.access_token,
      token_type: response.data.token_type,
      role: response.data.role,
      id: user,
    };
    onLogin(userData);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await performLogin(username, password);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Login gagal. Cek password dan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 transform transition-all hover:scale-[1.01]">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <div className="bg-blue-600 p-2 rounded-full">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Validasi Deskripsi</h2>
        <p className="text-center text-gray-500 mb-8">Masuk untuk memulai validasi</p>

        <form onSubmit={step === 1 ? handleCheckUsername : handlePasswordSubmit} className="space-y-6">
          {step === 1 ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="masukan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="masukan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => { setStep(1); setPassword(''); setError(''); }}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Ganti Username
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
              </>
            ) : (
              <>
                {step === 1 ? 'Lanjut' : 'Masuk'} <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}