import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDateDDMMYY } from '../utils/date';
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
  const { t } = useLanguage();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const openReviewModal = (booking, existingReview = null) => {
    setSelectedBooking(booking);
    setRating(existingReview?.rating || 5);
    setComment(existingReview?.comment || '');
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
        setReviewSuccessMsg('Review submitted successfully. Thank you!');
        setTimeout(() => {
          setReviewModalOpen(false);
          fetchMyBookings();
        }, 1200);
      }
    } catch (err) {
      console.error('Submit review error:', err);
      setReviewErrorMsg(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-3 py-1 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 rounded-full text-xs font-semibold">
            {t('mb_status_confirmed')}
          </span>
        );
      case 'checked_in':
        return (
          <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-semibold">
            {t('mb_status_checked_in')}
          </span>
        );
      case 'checked_out':
        return (
          <span className="px-3 py-1 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-full text-xs font-semibold">
            {t('mb_status_checked_out')}
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-full text-xs font-semibold">
            {t('mb_status_cancelled')}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
          {t('mb_title')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          {t('mb_desc')}
        </p>

        {location.state?.successMessage && (
          <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="font-bold">{location.state.successMessage}</p>
              {location.state.newBookingCode && (
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Booking Reference: <span className="font-mono font-bold">{location.state.newBookingCode}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading your reservations...</p>
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 shadow-sm hover:shadow-md transition flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
              >
                <div className="flex gap-5 items-start sm:items-center">
                  <img
                    src={b.room_types?.images?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80'}
                    alt={b.room_types?.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover flex-shrink-0"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950 px-2.5 py-0.5 rounded-lg">
                        {b.booking_code}
                      </span>
                      {getStatusBadge(b.status)}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {b.room_types?.name || 'Room'}
                    </h3>

                    <div className="flex flex-wrap gap-y-1 gap-x-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{t('search_checkin')}: <strong className="text-slate-700 dark:text-slate-200">{formatDateDDMMYY(b.check_in)}</strong></span>
                      <span>{t('search_checkout')}: <strong className="text-slate-700 dark:text-slate-200">{formatDateDDMMYY(b.check_out)}</strong></span>
                      <span>({b.total_nights} {t('co_nights')}, {b.num_rooms} {t('detail_room_unit')})</span>
                    </div>

                    <p className="text-xs text-slate-400 mt-2">
                      {t('co_due_at_hotel')}: <strong className="text-slate-800 dark:text-white text-sm">฿{Number(b.total_price).toLocaleString()}</strong>
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                  {b.status === 'checked_out' && (() => {
                    const existingRev = Array.isArray(b.reviews) ? b.reviews[0] : (b.reviews?.rating ? b.reviews : null);
                    return existingRev ? (
                      <button
                        onClick={() => openReviewModal(b, existingRev)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 rounded-xl text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition shadow-sm group"
                        title={existingRev.comment ? `"${existingRev.comment}"` : ''}
                      >
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform" />
                        <span>{t('mb_reviewed', { stars: existingRev.rating })}</span>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 underline ml-0.5">({t('detail_edit_review') || 'Edit'})</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => openReviewModal(b)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-md transition"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{t('mb_write_review')}</span>
                      </button>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-100 dark:border-slate-800 text-center shadow-sm">
            <Hotel className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{t('mb_no_bookings')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{t('mb_no_bookings_desc')}</p>
            <Link
              to="/#rooms"
              className="inline-block px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition"
            >
              {t('mb_btn_search')}
            </Link>
          </div>
        )}

        {/* Review Modal */}
        {reviewModalOpen && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t('mb_modal_title')}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                {selectedBooking.room_types?.name} ({selectedBooking.booking_code})
              </p>

              {reviewErrorMsg && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{reviewErrorMsg}</span>
                </div>
              )}

              {reviewSuccessMsg && (
                <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>{reviewSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {t('mb_modal_rating')}
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
                              : 'text-slate-200 dark:text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('mb_modal_comment')}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe your stay, service quality, room comfort..."
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl shadow-lg transition disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : t('mb_modal_submit')}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
