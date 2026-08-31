import React from 'react';
import { FileText, CheckCircle2, CircleDashed } from 'lucide-react';

export default function KpiCard({ stats }) {
  if (!stats) return null;

  const cards = [
    { label: 'Total Laporan', value: stats.total, icon: FileText, color: 'blue' },
    { label: 'Sudah Divalidasi', value: stats.validated, icon: CheckCircle2, color: 'green' },
    { label: 'Belum Divalidasi', value: stats.pending, icon: CircleDashed, color: 'amber' },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{value.toLocaleString('id-ID')}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}