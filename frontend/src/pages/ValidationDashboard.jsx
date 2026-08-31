import React, { useState, useEffect } from 'react';
import api from '../api';
import ReportCard from '../components/ReportCard';
import Sidebar from '../components/Sidebar';
import FilterBar from '../components/FilterBar';
import KpiCard from '../components/KpiCard';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const ITEMS_PER_PAGE = 5;

const ENDPOINT_BY_FILTER = {
  all: '/reviews',
  pending: '/reviews/pending',
  validated: '/reviews/validated',
};

const EMPTY_FILTERS = {
  sentimenOperasional: [],
  sentimenModel63: [],
  dateFrom: '',
  dateTo: '',
};

function buildFilterParams(filters) {
  const params = {};
  if (filters.sentimenOperasional.length > 0) {
    params.sentimen_operasional = filters.sentimenOperasional.join(',');
  }
  if (filters.sentimenModel63.length > 0) {
    params.sentimen_model63 = filters.sentimenModel63.join(',');
  }
  if (filters.dateFrom) params.date_from = filters.dateFrom;
  if (filters.dateTo) params.date_to = filters.dateTo;
  return params;
}

export default function ValidationPage({ user, onLogout }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInTab, setTotalInTab] = useState(0);

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [stats, setStats] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const endpoint = ENDPOINT_BY_FILTER[tab];
      const filterParams = buildFilterParams(filters);

      const response = await api.get(endpoint, {
        params: { page, page_size: ITEMS_PER_PAGE, ...filterParams },
      });

      const { items, total } = response.data;
      setReports(items);
      setTotalInTab(total);
      setTotalPages(total > 0 ? Math.ceil(total / ITEMS_PER_PAGE) : 1);

      // KPI card cuma dibutuhkan saat tab "all"
      if (tab === 'all') {
        const statsResponse = await api.get('/reviews/stats', { params: filterParams });
        setStats(statsResponse.data);
      }
    } catch (err) {
      console.error('Failed to fetch reports', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, tab, filters]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setPage(1);
    // filters SENGAJA tidak direset di sini -> filter tetap aktif antar menu (opsi 1)
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const handleValidate = async (validationData) => {
    try {
      const { temp_pk, sentimen_validasi, validation_in } = validationData;
      await api.post(`/reviews/${temp_pk}/validate`, { sentimen_validasi, validation_in });
      fetchReports();
    } catch (err) {
      console.error('Validation failed', err);
      alert(err.response?.data?.detail || 'Gagal mengirim validasi.');
    }
  };

  const tabLabel = { all: 'Semua Review', pending: 'Belum Divalidasi', validated: 'Sudah Divalidasi' };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar user={user} currentFilter={tab} onFilterChange={handleTabChange} onLogout={onLogout} />

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Validasi Sentiment Review</h1>
            <p className="text-gray-500 mt-1">
              {tabLabel[tab]}
              {tab !== 'all' && !loading && (
                <span className="ml-2 text-sm font-medium text-gray-400">
                  ({totalInTab.toLocaleString('id-ID')} laporan)
                </span>
              )}
            </p>
          </div>

          {tab === 'all' && <KpiCard stats={stats} />}

          <FilterBar filters={filters} onChange={handleFilterChange} onReset={handleResetFilters} />

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-300">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl">📭</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Tidak ada laporan</h3>
              <p className="text-gray-500 mt-1">Tidak ada data untuk filter yang dipilih.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reports.map((report) => (
                <ReportCard key={report.temp_pk} report={report} onValidate={handleValidate} />
              ))}
            </div>
          )}

          {totalPages > 0 && reports.length > 0 && (
            <div className="mt-8 flex justify-center items-center space-x-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium text-gray-600">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
