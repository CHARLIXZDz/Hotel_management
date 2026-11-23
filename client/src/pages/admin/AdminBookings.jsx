import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { formatDateDDMMYY } from '../../utils/date';
import {
  Search,
  User,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';

export default function AdminBookings() {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);

      const res = await api.get(`/bookings?${params.toString()}`);
      if (res.data?.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Fetch bookings error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {t('adm_bookings_title')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('adm_bookings_sub')}
        </p>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white dark:bg-[#0f172a] p-4 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between transition">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-auto flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('adm_search_placeholder')}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition"
          >
            Search
          </button>
        </form>

        {/* Status Filter Tabs */}
        <div className="w-full sm:w-auto flex gap-1.5 overflow-x-auto pb-2 sm:pb-0">
          {[
            { id: 'all', label: t('adm_tab_all') },
            { id: 'confirmed', label: t('adm_tab_confirmed') },
            { id: 'checked_in', label: t('adm_tab_checked_in') },
            { id: 'checked_out', label: t('adm_tab_checked_out') },
            { id: 'cancelled', label: t('adm_tab_cancelled') }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">Loading reservations...</p>
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition"
            >
              {/* Booking Info */}
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-extrabold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950 px-3 py-1 rounded-xl">
                    {b.booking_code}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    b.status === 'confirmed' ? 'bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300' :
                    b.status === 'checked_in' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                    b.status === 'checked_out' ? 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300' : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                  }`}>
                    {b.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(b.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {b.room_types?.name} ({b.num_rooms} {t('detail_room_unit')}, {b.num_guests} {t('search_guests')})
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 mt-1 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      {formatDateDDMMYY(b.check_in)} → {formatDateDDMMYY(b.check_out)} ({b.total_nights} {t('co_nights')})
                    </span>
                    <span>|</span>
                    <span>{t('co_due_at_hotel')}: <strong className="text-slate-900 dark:text-white text-sm">฿{Number(b.total_price).toLocaleString()}</strong> (Pay at hotel)</span>
                  </div>
                </div>

                {/* Guest Contact Details */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-tr from-amber-500 to-primary-600 text-white font-bold flex items-center justify-center text-[10px] shadow-sm flex-shrink-0">
                      {b.guest_avatar || b.avatar_url ? (
                        <img
                          src={b.guest_avatar || b.avatar_url}
                          alt={b.guest_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            if (e.target.parentElement) {
                              e.target.parentElement.innerText = (b.guest_name || 'G')[0].toUpperCase();
                            }
                          }}
                        />
                      ) : (
                        (b.guest_name || 'G')[0].toUpperCase()
                      )}
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {b.guest_name}
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {b.guest_phone}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {b.guest_email}
                  </span>
                  {b.special_requests && (
                    <div className="w-full text-slate-500 italic pt-1 border-t border-slate-200 dark:border-slate-700">
                      "{b.special_requests}"
                    </div>
                  )}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex flex-wrap lg:flex-col gap-2 items-end justify-end">
                {b.status === 'confirmed' && (
                  <>
                    <button
                      disabled={updatingId === b.id}
                      onClick={() => handleUpdateStatus(b.id, 'checked_in')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                    >
                      {t('adm_btn_checkin')}
                    </button>
                    <button
                      disabled={updatingId === b.id}
                      onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                      className="px-4 py-2 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold transition"
                    >
                      {t('adm_btn_cancel')}
                    </button>
                  </>
                )}

                {b.status === 'checked_in' && (
                  <button
                    disabled={updatingId === b.id}
                    onClick={() => handleUpdateStatus(b.id, 'checked_out')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                  >
                    {t('adm_btn_checkout')}
                  </button>
                )}

                {(b.status === 'checked_out' || b.status === 'cancelled') && (
                  <span className="text-xs text-slate-400 font-medium">{t('adm_completed')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0f172a] p-12 rounded-3xl border border-slate-100 dark:border-slate-800 text-center">
          <p className="text-slate-500 font-medium">{t('adm_no_bookings')}</p>
        </div>
      )}
    </div>
  );
}
