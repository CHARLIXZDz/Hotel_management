import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import DateInput from '../components/DateInput';
import { formatDisplayDate } from '../utils/date';
import {
  Users,
  Bed,
  Maximize2,
  Calendar,
  CheckCircle,
  Star,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  Send,
  MessageSquare
} from 'lucide-react';

export default function RoomDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const { t } = useLanguage();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);

  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || tomorrow.toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || dayAfter.toISOString().split('T')[0]);
  const [numRooms, setNumRooms] = useState(1);
  const [numGuests, setNumGuests] = useState(searchParams.get('guests') || '2');

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get(`/rooms/${id}`);
        if (res.data?.success) {
          setRoom(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching room detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-xl font-bold text-slate-800 dark:text-white">Room not found</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm"
        >
          {t('detail_back')}
        </button>
      </div>
    );
  }

  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  const totalNights = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
  const totalPrice = parseFloat(room.price_per_night) * totalNights * numRooms;

  const handleProceedToBooking = () => {
    if (!user) {
      openAuthModal('signin');
      return;
    }

    const params = new URLSearchParams({
      roomId: room.id,
      checkIn,
      checkOut,
      guests: numGuests,
      rooms: numRooms
    });

    navigate(`/checkout?${params.toString()}`);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('signin');
      return;
    }
    if (!reviewRating) return;

    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        room_type_id: room.id,
        rating: reviewRating,
        comment: reviewComment
      });

      if (res.data?.success) {
        Swal.fire({
          icon: 'success',
          title: t('detail_review_success'),
          timer: 2000,
          showConfirmButton: false
        });
        setReviewComment('');
        const newRev = res.data.data;
        const newReviews = [
          {
            id: newRev?.id || Date.now(),
            rating: reviewRating,
            comment: reviewComment,
            created_at: newRev?.created_at || new Date().toISOString(),
            user_id: user.id,
            profiles: {
              full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest',
              avatar_url: user?.user_metadata?.avatar_url || ''
            }
          },
          ...(room.reviews || [])
        ];
        const newAvg = (
          newReviews.reduce((sum, r) => sum + r.rating, 0) / newReviews.length
        ).toFixed(1);

        setRoom(prev => ({
          ...prev,
          reviews: newReviews,
          avg_rating: parseFloat(newAvg),
          review_count: newReviews.length
        }));
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to submit review'
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const images = room.images && room.images.length > 0
    ? room.images
    : ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 lg:py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{t('detail_back')}</span>
        </button>

        {/* Room Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
              Luxury Accommodation
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
              {room.name}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {room.avg_rating || '5.0'} ({room.review_count || 0} {t('detail_reviews_title')})
              </span>
              <span>•</span>
              <span>{room.bed_type}</span>
              <span>•</span>
              <span>{t('rooms_size', { size: room.size_sqm })}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">{t('rooms_price_start')}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                ฿{Number(room.price_per_night).toLocaleString()}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">{t('rooms_per_night')}</span>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
          <div className="lg:col-span-2 aspect-[16/10] rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-md">
            <img
              src={images[activeImageIndex]}
              alt={room.name}
              className="w-full h-full object-cover transition duration-300"
            />
          </div>

          <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative flex-1 aspect-[16/10] rounded-2xl overflow-hidden border-2 transition ${
                  activeImageIndex === idx ? 'border-primary-600 scale-[1.02]' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Details (Left) */}
          <div className="lg:col-span-2 space-y-10">
            {/* Description */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('detail_about_title')}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {room.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary-600 dark:text-primary-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">{t('search_guests')}</span>
                    <span className="font-semibold">{t('rooms_max_guests', { count: room.capacity })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary-600 dark:text-primary-400">
                    <Bed className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Bed Type</span>
                    <span className="font-semibold">{room.bed_type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary-600 dark:text-primary-400">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Room Size</span>
                    <span className="font-semibold">{t('rooms_size', { size: room.size_sqm })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('detail_amenities_title')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(room.amenities || []).map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('detail_reviews_title')}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {room.reviews?.length || 0} {t('mb_reviewed').replace('{stars}', '').trim() || 'reviews'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-2xl text-sm font-bold shadow-sm border border-amber-200/50 dark:border-amber-900/50">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{room.avg_rating || '5.0'} / 5.0</span>
                </div>
              </div>

              {/* Add Comment / Review Form */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                {user ? (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-primary-600 text-white font-bold flex items-center justify-center text-sm shadow">
                          {user.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            (user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {user.user_metadata?.full_name || user.email?.split('@')[0]}
                          </p>
                          <span className="text-[10px] text-slate-400">{t('detail_write_review')}</span>
                        </div>
                      </div>

                      {/* Interactive Star Rating */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            onMouseEnter={() => setReviewHoverRating(star)}
                            onMouseLeave={() => setReviewHoverRating(0)}
                            className="p-1 transition-transform hover:scale-125 focus:outline-none"
                            title={`${star} Star`}
                          >
                            <Star
                              className={`w-5 h-5 transition-colors ${
                                (reviewHoverRating || reviewRating) >= star
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder={t('detail_review_placeholder')}
                        rows={3}
                        required
                        className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 dark:text-white placeholder-slate-400 resize-none transition"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-primary-600/20 transition transform active:scale-95"
                      >
                        {submittingReview ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{t('detail_review_submitting')}</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>{t('detail_review_submit')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <MessageSquare className="w-8 h-8 text-primary-500 mx-auto mb-2 opacity-80" />
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                      {t('detail_review_login_prompt')}
                    </p>
                    <button
                      type="button"
                      onClick={() => openAuthModal('signin')}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow transition"
                    >
                      {t('nav_login')}
                    </button>
                  </div>
                )}
              </div>

              {/* Reviews List */}
              {room.reviews && room.reviews.length > 0 ? (
                <div className="space-y-5 divide-y divide-slate-100 dark:divide-slate-800">
                  {room.reviews.map((rev) => {
                    const authorName = rev.profiles?.full_name || rev.guest_name || 'Guest';
                    const isCurrentUser = user && (user.id === rev.user_id || rev.profiles?.full_name === (user.user_metadata?.full_name || user.email?.split('@')[0]));
                    const avatarUrl = rev.profiles?.avatar_url || (isCurrentUser ? user.user_metadata?.avatar_url : null);

                    return (
                      <div key={rev.id} className="pt-5 first:pt-0">
                        <div className="flex items-start justify-between mb-2.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-primary-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                              {avatarUrl ? (
                                <img src={avatarUrl} alt={authorName} className="w-full h-full object-cover" />
                              ) : (
                                authorName[0].toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-slate-800 dark:text-white">
                                  {authorName}
                                </span>
                                {isCurrentUser && (
                                  <span className="text-[10px] px-1.5 py-0.5 bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 rounded-md font-medium border border-primary-200/50 dark:border-primary-800/50">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">
                                {formatDisplayDate(rev.created_at)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-lg">
                            {[...Array(rev.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                            ))}
                          </div>
                        </div>

                        {rev.comment && (
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-13 sm:pl-13 mt-1">
                            {rev.comment}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">{t('detail_no_reviews')}</p>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Booking Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('detail_summary_title')}</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    ฿{Number(room.price_per_night).toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{t('rooms_per_night')}</span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                {/* Check-in */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    {t('search_checkin')}
                  </label>
                  <DateInput
                    min={new Date().toISOString().split('T')[0]}
                    value={checkIn}
                    onChange={(e) => {
                      setCheckIn(e.target.value);
                      if (e.target.value >= checkOut) {
                        const next = new Date(e.target.value);
                        next.setDate(next.getDate() + 1);
                        setCheckOut(next.toISOString().split('T')[0]);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500"
                  />
                </div>

                {/* Check-out */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    {t('search_checkout')}
                  </label>
                  <DateInput
                    min={checkIn}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500"
                  />
                </div>

                {/* Guests & Rooms */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      {t('search_guests')}
                    </label>
                    <select
                      value={numGuests}
                      onChange={(e) => setNumGuests(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {[...Array(room.capacity)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1} Guests</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      {t('detail_room_count')}
                    </label>
                    <select
                      value={numRooms}
                      onChange={(e) => setNumRooms(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {[1, 2, 3].map((n) => (
                        <option key={n} value={n}>{n} {t('detail_room_unit')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Price Calculation */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>฿{Number(room.price_per_night).toLocaleString()} × {totalNights} {t('co_nights')} × {numRooms} {t('detail_room_unit')}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">฿{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>{t('detail_tax_included')}</span>
                  <span>{t('detail_tax_free')}</span>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{t('detail_total')}</span>
                  <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">฿{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Policy Guarantee Banner */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <div>
                  <p className="font-bold">{t('detail_pay_guarantee_title')}</p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">{t('detail_pay_guarantee_sub')}</p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleProceedToBooking}
                className="w-full py-3.5 px-4 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary-600/30 transition flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
              >
                <span>{user ? t('detail_proceed_btn') : t('detail_login_to_book')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
