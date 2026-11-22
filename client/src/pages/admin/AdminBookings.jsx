import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';

export default function AdminBookings() {
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
      alert(err.response?.data?.message || 'ไม่สามารถอัปเดตสถานะได้');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          จัดการรายการจองห้องพัก
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          ตรวจสอบข้อมูลผู้เข้าพัก เปลี่ยนสถานะ Check-in, Check-out หรือยกเลิกการจอง
        </p>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-auto flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาด้วยรหัสจอง, ชื่อลูกค้า, อีเมล หรือเบอร์โทร..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-xl"
          >
            ค้นหา
          </button>
        </form>

        {/* Status Filter Tabs */}
        <div className="w-full sm:w-auto flex gap-1.5 overflow-x-auto pb-2 sm:pb-0">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'confirmed', label: 'รอเช็คอิน' },
            { id: 'checked_in', label: 'กำลังเข้าพัก' },
            { id: 'checked_out', label: 'เช็คเอาท์แล้ว' },
            { id: 'cancelled', label: 'ยกเลิก' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
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
          <p className="text-sm text-slate-500">กำลังโหลดรายการจอง...</p>
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              {/* Booking Info */}
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-extrabold text-amber-900 bg-amber-100 px-3 py-1 rounded-xl">
                    {b.booking_code}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    b.status === 'confirmed' ? 'bg-sky-50 text-sky-700' :
                    b.status === 'checked_in' ? 'bg-emerald-50 text-emerald-700' :
                    b.status === 'checked_out' ? 'bg-purple-50 text-purple-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {b.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    จองเมื่อ: {new Date(b.created_at).toLocaleDateString('th-TH')}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {b.room_types?.name} ({b.num_rooms} ห้อง, {b.num_guests} ท่าน)
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 mt-1 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      {b.check_in} → {b.check_out} ({b.total_nights} คืน)
                    </span>
                    <span>|</span>
                    <span>ยอดชำระ: <strong className="text-slate-900 text-sm">฿{Number(b.total_price).toLocaleString()}</strong> (Pay at hotel)</span>
                  </div>
                </div>

                {/* Guest Contact Details */}
                <div className="p-3 bg-slate-50 rounded-2xl flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium text-slate-800">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {b.guest_name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {b.guest_phone}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {b.guest_email}
                  </span>
                  {b.special_requests && (
                    <div className="w-full text-slate-500 italic pt-1 border-t border-slate-200">
                      คำขอพิเศษ: "{b.special_requests}"
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
                      เช็คอิน (Checked In)
                    </button>
                    <button
                      disabled={updatingId === b.id}
                      onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition"
                    >
                      ยกเลิกการจอง
                    </button>
                  </>
                )}

                {b.status === 'checked_in' && (
                  <button
                    disabled={updatingId === b.id}
                    onClick={() => handleUpdateStatus(b.id, 'checked_out')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                  >
                    เช็คเอาท์ (Checked Out)
                  </button>
                )}

                {(b.status === 'checked_out' || b.status === 'cancelled') && (
                  <span className="text-xs text-slate-400 font-medium">รายการเสร็จสิ้นแล้ว</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
          <p className="text-slate-500 font-medium">ไม่พบรายการจองตามเงื่อนไขที่เลือก</p>
        </div>
      )}
    </div>
  );
}
