import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Send, Edit2, Loader2, Lock } from 'lucide-react';

const SENTIMENT_OPTIONS = ['Positif', 'Netral', 'Negatif'];
const MAX_EDITS = 3;

function formatDuration(secondsStr) {
  if (!secondsStr) return '-';
  const totalSeconds = Math.round(parseFloat(secondsStr));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds} detik`;
  return `${minutes} menit ${seconds} detik`;
}

function formatDateTime(isoString) {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default function ReportCard({ report, onValidate }) {
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentiment, setSentiment] = useState(null);
  const [validationIn, setValidationIn] = useState(null);

  useEffect(() => {
    if (report.sentimen_validasi) {
      setSentiment(report.sentimen_validasi);
      setIsValidating(false);
    } else {
      setSentiment(null);
      setIsValidating(false);
    }
  }, [report]);

  const editCount = report.edit_count || 0;
  const remainingEdits = MAX_EDITS - editCount;
  const canEdit = remainingEdits > 0;

  const handleStart = () => {
    setIsValidating(true);
    setValidationIn(new Date().toISOString());
  };

  const handleCancel = () => {
    if (report.sentimen_validasi) {
      setSentiment(report.sentimen_validasi);
      setIsValidating(false);
      setValidationIn(null);
    } else {
      setIsValidating(false);
      setSentiment(null);
      setValidationIn(null);
    }
  };

  const handleSubmit = async () => {
    if (!sentiment || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onValidate({
        temp_pk: report.temp_pk,
        sentimen_validasi: sentiment,
        validation_in: validationIn,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCompleted = !!report.sentimen_validasi && !isValidating;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-mono text-blue-500 bg-blue-50 px-2 py-1 rounded">
          {report.temp_pk}
        </span>
        <div className="flex items-center gap-3">
          {report.tanggal_review && (
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">
              📅 {formatDate(report.tanggal_review)}
            </span>
          )}
          {isCompleted && (
            <span className="flex items-center text-green-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4 mr-1" /> Validated
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <span className="block text-gray-400 text-xs mb-1">Sentimen Operasional</span>
          <span className="font-semibold text-gray-700">{report.negatif || '-'}</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <span className="block text-gray-400 text-xs mb-1">Sentimen Rekomendasi</span>
          <span className="font-semibold text-gray-700">{report.sentimen_model63 || '-'}</span>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Isi Ulasan</h3>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-800 leading-relaxed font-sans text-lg h-48 overflow-y-auto">
          {report.isi_ulasan}
        </div>
      </div>

      {isCompleted ? (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-500">Hasil Validasi</span>
            {canEdit ? (
              <button onClick={handleStart} className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                <Edit2 className="w-3 h-3 mr-1" /> Edit ({remainingEdits}x tersisa)
              </button>
            ) : (
              <span className="text-gray-400 text-xs flex items-center">
                <Lock className="w-3 h-3 mr-1" /> Batas edit tercapai
              </span>
            )}
          </div>
          <div className="text-sm mb-3">
            <span className="block text-gray-400 text-xs">Sentimen Validasi Review</span>
            <span
              className={`font-semibold ${
                sentiment === 'Positif' ? 'text-green-600' : sentiment === 'Negatif' ? 'text-red-600' : 'text-gray-600'
              }`}
            >
              {sentiment || '-'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 border-t pt-3">
            <div>
              <span className="block text-gray-400">Mulai</span>
              {formatDateTime(report.validation_in)}
            </div>
            <div>
              <span className="block text-gray-400">Selesai</span>
              {formatDateTime(report.validation_out)}
            </div>
            <div>
              <span className="block text-gray-400">Durasi</span>
              {formatDuration(report.time_to_validate)}
            </div>
            <div>
              <span className="block text-gray-400">Divalidasi oleh</span>
              {report.validated_by || '-'}
            </div>
          </div>
        </div>
      ) : (
        <>
          {!isValidating ? (
            <button
              onClick={handleStart}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <Clock className="w-4 h-4 mr-2" /> Mulai Validasi
            </button>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Sentimen Validasi Review</label>
              <div className="flex space-x-2 mb-6">
                {SENTIMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSentiment(opt)}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium border transition-all ${
                      sentiment === opt
                        ? opt === 'Positif'
                          ? 'bg-green-100 border-green-500 text-green-700'
                          : opt === 'Negatif'
                          ? 'bg-red-100 border-red-500 text-red-700'
                          : 'bg-gray-100 border-gray-500 text-gray-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!sentiment || isSubmitting}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" /> Submit Validasi
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
