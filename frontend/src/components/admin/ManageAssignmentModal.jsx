import React, { useState } from 'react';
import api from '../../api';
import { X, MinusCircle, ArrowRightLeft, Loader2 } from 'lucide-react';

export default function ManageAssignmentModal({ user, otherValidators, onClose, onSuccess }) {
  const [mode, setMode] = useState('reduce'); // 'reduce' | 'transfer'
  const [count, setCount] = useState('');
  const [targetId, setTargetId] = useState(otherValidators[0]?.id || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const pendingCount = user.total_assigned - user.total_validated;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedCount = parseInt(count, 10);
    if (!parsedCount || parsedCount <= 0) {
      setError('Jumlah harus lebih dari 0.');
      return;
    }
    if (parsedCount > pendingCount) {
      setError(`Jumlah melebihi tugas yang belum divalidasi (${pendingCount}).`);
      return;
    }
    if (mode === 'transfer' && !targetId) {
      setError('Pilih validator tujuan.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'reduce') {
        const res = await api.post('/admin/reviews/unassign', { validator_id: user.id, count: parsedCount });
        onSuccess(`Berhasil mengurangi ${res.data.unassigned_count} tugas.`);
      } else {
        const res = await api.post('/admin/reviews/reassign', {
          from_validator_id: user.id,
          to_validator_id: targetId,
          count: parsedCount,
        });
        onSuccess(`Berhasil mengalihkan ${res.data.reassigned_count} tugas.`);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Kelola Tugas — @{user.username}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-50 border border-slate-200 text-slate-700 p-3 rounded-lg text-sm mb-4">
          Tugas belum divalidasi: <strong>{pendingCount}</strong> dari total {user.total_assigned} yang di-assign.
        </div>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode('reduce')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border flex items-center justify-center gap-1.5 ${
              mode === 'reduce' ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-gray-200 text-gray-500'
            }`}
          >
            <MinusCircle className="w-4 h-4" /> Kurangi Tugas
          </button>
          <button
            type="button"
            onClick={() => setMode('transfer')}
            disabled={otherValidators.length === 0}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border flex items-center justify-center gap-1.5 disabled:opacity-40 ${
              mode === 'transfer' ? 'bg-orange-50 border-orange-300 text-orange-700' : 'bg-white border-gray-200 text-gray-500'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" /> Alihkan ke Lain
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'transfer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alihkan ke Validator</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500"
                value={targetId}
                onChange={(e) => setTargetId(parseInt(e.target.value, 10))}
              >
                {otherValidators.map((v) => (
                  <option key={v.id} value={v.id}>{v.username}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
            <input
              type="number"
              min="1"
              max={pendingCount}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              placeholder={`Maks. ${pendingCount}`}
            />
          </div>

          {error && <div className="bg-red-50 text-red-600 p-2.5 rounded-lg text-sm">{error}</div>}

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || pendingCount === 0}
              className="px-4 py-2 text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'reduce' ? 'Kurangi Sekarang' : 'Alihkan Sekarang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}