import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  CalendarCheck2,
  DollarSign,
  BedDouble,
  Users,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function AdminDashboard() {
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
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          ภาพรวมการดำเนินงานโรงแรม
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          สถิติยอดการจอง รายได้ที่เก็บแล้ว และสถานะห้องพักแบบเรียลไทม์
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Bookings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
            <CalendarCheck2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">การจองทั้งหมด</span>
            <span className="text-2xl font-bold text-slate-900">{stats?.totalBookings || 0} รายการ</span>
          </div>
        </div>

        {/* Revenue Collected */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">รายได้ที่เก็บแล้ว</span>
            <span className="text-2xl font-bold text-emerald-700">฿{(stats?.totalRevenue || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Currently Checked In */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">กำลังเข้าพัก</span>
            <span className="text-2xl font-bold text-slate-900">{stats?.checkedInCount || 0} ห้อง</span>
          </div>
        </div>

        {/* Pending Check-ins */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">รอการเช็คอิน</span>
            <span className="text-2xl font-bold text-amber-600">{stats?.confirmedCount || 0} รายการ</span>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">รายการจองล่าสุด 5 รายการ</h2>
          <Link
            to="/admin/bookings"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <span>ดูรายการทั้งหมด</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3">
              <tr>
                <th className="py-3 px-4">รหัสการจอง</th>
                <th className="py-3 px-4">ชื่อผู้เข้าพัก</th>
                <th className="py-3 px-4">ประเภทห้อง</th>
                <th className="py-3 px-4">ช่วงเวลา</th>
                <th className="py-3 px-4">ยอดเงิน</th>
                <th className="py-3 px-4">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                stats.recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{b.booking_code}</td>
                    <td className="py-3 px-4">{b.guest_name}</td>
                    <td className="py-3 px-4">{b.room_types?.name}</td>
                    <td className="py-3 px-4 text-xs">{b.check_in} → {b.check_out}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">฿{Number(b.total_price).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        b.status === 'confirmed' ? 'bg-sky-50 text-sky-700' :
                        b.status === 'checked_in' ? 'bg-emerald-50 text-emerald-700' :
                        b.status === 'checked_out' ? 'bg-purple-50 text-purple-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400">ยังไม่มีรายการจอง</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
