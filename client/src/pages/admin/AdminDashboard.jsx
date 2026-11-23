import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { formatDateDDMMYY } from '../../utils/date';
import {
  CalendarCheck2,
  DollarSign,
  Users,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats/dashboard');
        if (res.data?.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Fetch dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {t('adm_dashboard_title')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('adm_dashboard_sub')}
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Bookings */}
        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
            <CalendarCheck2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">{t('adm_total_bookings')}</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.totalBookings || 0}</span>
          </div>
        </div>

        {/* Revenue Collected */}
        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">{t('adm_revenue_collected')}</span>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">฿{(stats?.totalRevenue || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Currently Checked In */}
        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">{t('adm_currently_staying')}</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.checkedInCount || 0} {t('detail_room_unit')}</span>
          </div>
        </div>

        {/* Pending Check-ins */}
        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">{t('adm_pending_checkins')}</span>
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats?.confirmedCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 sm:p-8 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('adm_recent_5')}</h2>
          <Link
            to="/admin/bookings"
            className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center gap-1"
          >
            <span>{t('adm_view_all')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
              <tr>
                <th className="py-3 px-4">{t('adm_col_code')}</th>
                <th className="py-3 px-4">{t('adm_col_guest')}</th>
                <th className="py-3 px-4">{t('adm_col_room')}</th>
                <th className="py-3 px-4">{t('adm_col_period')}</th>
                <th className="py-3 px-4">{t('adm_col_amount')}</th>
                <th className="py-3 px-4">{t('adm_col_status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                stats.recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{b.booking_code}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-amber-500 to-primary-600 text-white font-bold flex items-center justify-center text-xs shadow-sm flex-shrink-0">
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
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {b.guest_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{b.room_types?.name}</td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {formatDateDDMMYY(b.check_in)} → {formatDateDDMMYY(b.check_out)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">฿{Number(b.total_price).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        b.status === 'confirmed' ? 'bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300' :
                        b.status === 'checked_in' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                        b.status === 'checked_out' ? 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300' : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    {t('adm_no_bookings')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
