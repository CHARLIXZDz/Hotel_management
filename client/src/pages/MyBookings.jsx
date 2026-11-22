import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  CheckCircle,
  Star,
  Hotel,
  AlertCircle,
  X,
  MessageSquare
} from 'lucide-react';

export default function MyBookings() {
  const { user } = useAuth();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/my');
      if (res.data?.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Fetch my bookings error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyBookings();
    }
  }, [user]);

  const openReviewModal = (booking) => {
    setSelectedBooking(booking);
    setRating(5);
    setComment('');
    setReviewSuccessMsg('');
    setReviewErrorMsg('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewErrorMsg('');
    setSubmittingReview(true);

    try {
      const res = await api.post('/reviews', {
        booking_id: selectedBooking.id,
        room_type_id: selectedBooking.room_type_id,
        rating,
        comment
      });

      if (res.data?.success) {
        setReviewSuccessMsg('ส่งรีวิวสำเร็จ ขอบคุณสำหรับความคิดเห็นครับ!');
        setTimeout(() => {
          setReviewModalOpen(false);
          fetchMyBookings();
        }, 1200);
      }
    } catch (err) {
      console.error('Submit review error:', err);
      setReviewErrorMsg(err.response?.data?.message || 'ส่งรีวิวไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-3 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-full text-xs font-semibold">
            ยืนยันแล้ว (รอเช็คอิน)
          </span>
        );
      case 'checked_in':
        return (
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
            กำลังเข้าพัก (Checked In)
          </span>
        );
      case 'checked_out':
        return (
          <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-semibold">
            เข้าพักเสร็จสิ้น (Checked Out)
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-semibold">
            ยกเลิกแล้ว
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          ประวัติการจองห้องพัก
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          ตรวจสอบรายการจอง รหัสการจอง และเขียนรีวิวหลังเข้าพัก
        </p>

        {/* Success Alert if navigated from Checkout */}
        {location.state?.successMessage && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <div>
              <p className="font-bold">{location.state.successMessage}</p>
              {location.state.newBookingCode && (
                <p className="text-xs text-emerald-700 mt-0.5">
                  รหัสการจองของคุณคือ: <span className="font-mono font-bold">{location.state.newBookingCode}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-500">กำลังโหลดรายการจองของคุณ...</p>
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm hover:shadow-md transition flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
              >
                <div className="flex gap-5 items-start sm:items-center">
                  <img
                    src={b.room_types?.images?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80'}
                    alt={b.room_types?.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover flex-shrink-0"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-lg">
                        {b.booking_code}
                      </span>
                      {getStatusBadge(b.status)}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">
                      {b.room_types?.name || 'ห้องพัก'}
                    </h3>

                    <div className="flex flex-wrap gap-y-1 gap-x-4 mt-2 text-xs text-slate-500">
                      <span>เช็คอิน: <strong className="text-slate-700">{b.check_in}</strong></span>
                      <span>เช็คเอาท์: <strong className="text-slate-700">{b.check_out}</strong></span>
                      <span>({b.total_nights} คืน, {b.num_rooms} ห้อง)</span>
                    </div>

                    <p className="text-xs text-slate-400 mt-2">
                      ชำระเงิน ณ ที่พัก: <strong className="text-slate-800 text-sm">฿{Number(b.total_price).toLocaleString()}</strong>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                  {b.status === 'checked_out' && (
                    <>
                      {b.reviews && b.reviews.length > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          รีวิวแล้ว ({b.reviews[0].rating} ดาว)
                        </span>
                      ) : (
                        <button
                          onClick={() => openReviewModal(b)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-medium text-xs rounded-xl shadow-md transition"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>เขียนรีวิวห้องพัก</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center shadow-sm">
            <Hotel className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">ยังไม่มีประวัติการจอง</h3>
            <p className="text-xs text-slate-500 mb-6">คุณยังไม่ได้ทำการจองห้องพักใดๆ กับเรา</p>
            <Link
              to="/#rooms"
              className="inline-block px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition"
            >
              ค้นหาและจองห้องพัก
            </Link>
          </div>
        )}

        {/* Review Modal */}
        {reviewModalOpen && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-slate-900 mb-1">เขียนรีวิวห้องพัก</h2>
              <p className="text-xs text-slate-500 mb-6">
                ห้อง {selectedBooking.room_types?.name} (รหัสการจอง: {selectedBooking.booking_code})
              </p>

              {reviewErrorMsg && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{reviewErrorMsg}</span>
                </div>
              )}

              {reviewSuccessMsg && (
                <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>{reviewSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    คะแนนความพึงพอใจ
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    ความคิดเห็นของคุณ
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="เล่าประสบการณ์ความประทับใจ ความสะอาด หรือบริการที่ได้รับ..."
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl shadow-lg transition disabled:opacity-50"
                >
                  {submittingReview ? 'กำลังส่งรีวิว...' : 'บันทึกรีวิว'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
