import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown, X } from 'lucide-react';

const SENTIMENT_OPTIONS = ['Positif', 'Netral', 'Negatif'];

function useClickOutside(ref, onOutside) {
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onOutside();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, onOutside]);
}

function CheckboxGroup({ label, selected, onToggle }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-2">{label}</p>
      <div className="space-y-1.5">
        {SENTIMENT_OPTIONS.map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => onToggle(opt)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function FilterBar({ filters, onChange, onReset }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  useClickOutside(panelRef, () => setOpen(false));

  const activeCount =
    filters.sentimenOperasional.length +
    filters.sentimenModel63.length +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  const isActive = activeCount > 0;

  const toggleValue = (key, value) => {
    const current = filters[key];
    const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onChange({ ...filters, [key]: updated });
  };

  return (
    <div className="relative mb-6" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors ${
          isActive
            ? 'bg-blue-600 border-blue-600 text-white'
            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Filter className="w-4 h-4" />
        {isActive ? `Filter Aktif (${activeCount})` : 'Filter'}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-72 bg-white rounded-xl border border-gray-200 shadow-lg p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <CheckboxGroup
              label="Sentimen Operasional"
              selected={filters.sentimenOperasional}
              onToggle={(v) => toggleValue('sentimenOperasional', v)}
            />
            <CheckboxGroup
              label="Sentimen Rekomendasi"
              selected={filters.sentimenModel63}
              onToggle={(v) => toggleValue('sentimenModel63', v)}
            />
          </div>

          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">Rentang Tanggal Review</p>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-600 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-gray-300 text-xs">s/d</span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-600 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {isActive && (
            <button
              onClick={onReset}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-600 border-t pt-3 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Reset Semua Filter
            </button>
          )}
        </div>
      )}
    </div>
  );
}
