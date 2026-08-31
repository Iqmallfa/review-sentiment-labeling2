import React, { useState, useEffect } from 'react';
import api from '../../api';
import { X, Send, Loader2 } from 'lucide-react';

export default function AssignModal({ validators, onClose, onSuccess }) {
  const [validatorId, setValidatorId] = useState(validators[0]?.id || '');
  const [count, setCount] = useState('');
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/admin/reviews/summary');
        setSummary(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSummary(false);
      }
    };
    fetchSummary();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedCount = parseInt(count, 10);
    if (!validatorId) {
      setError('Pilih validator tujuan.');
      return;
    }
    if (!parsedCount || parsedCount <= 0) {
      setError('Jumlah harus lebih dari 0.');
      return;
    }
    if (summary && parsedCount > summary.unassigned) {
      setError(`Jumlah melebihi stok tersedia (${summary.unassigned}).`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/admin/reviews/assign', {
        validator_id: validatorId,
        count: parsedCount,
      });
      onSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal melakukan assign.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Assign Data Review</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Counter stok tersedia - inilah notifikasi yang Anda minta */}
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-sm mb-4">
          {loadingSummary ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Menghitung stok...
            </span>
          ) : (
            <>
              <strong>{summary?.unassigned?.toLocaleString('id-ID') ?? 0}</strong> review belum di-assign, siap
              untuk di-assign. ({summary?.assigned?.toLocaleString('id-ID') ?? 0} dari{' '}
              {summary?.total_reviews?.toLocaleString('id-ID') ?? 0} sudah punya validator)
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign ke Validator</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500"
              value={validatorId}
              onChange={(e) => setValidatorId(parseInt(e.target.value, 10))}
            >
              {validators.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.username} (sudah punya {v.total_assigned} tugas)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Data</label>
            <input
              type="number"
              min="1"
              max={summary?.unassigned || undefined}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              placeholder={`Maks. ${summary?.unassigned ?? '...'}`}
            />
          </div>

          {error && <div className="bg-red-50 text-red-600 p-2.5 rounded-lg text-sm">{error}</div>}

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || (summary && summary.unassigned === 0)}
              className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Assign Sekarang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}