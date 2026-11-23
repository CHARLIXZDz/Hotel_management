import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { formatDateDDMMYY } from '../../utils/date';
import Swal from 'sweetalert2';
import {
  MessageSquareQuote,
  Star,
  Trash2,
  Search,
  Filter,
  Building,
  Calendar,
  User,
  ThumbsUp,
  Award,
  Sparkles,
  ExternalLink,
  MessageCircle,
  RefreshCw
} from 'lucide-react';

export default function AdminReviews() {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchReviewsAndRooms = async () => {
    setLoading(true);
    try {
      const [revRes, roomRes] = await Promise.all([
        api.get('/reviews'),
        api.get('/rooms')
      ]);

      if (revRes.data?.success) {
        setReviews(revRes.data.data || []);
      }
      if (roomRes.data?.success) {
        setRooms(roomRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsAndRooms();
  }, []);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      // Room filter
      if (selectedRoom !== 'all') {
        const rId = rev.room_types?.id || rev.room_type_id;
        if (rId !== selectedRoom) return false;
      }

      // Rating filter
      if (selectedRating !== 'all') {
        if (Number(rev.rating) !== Number(selectedRating)) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const guestName = (rev.profiles?.full_name || '').toLowerCase();
        const guestEmail = (rev.profiles?.email || '').toLowerCase();
        const comment = (rev.comment || '').toLowerCase();
        const roomName = (rev.room_types?.name || '').toLowerCase();
        const bookingCode = (rev.bookings?.booking_code || '').toLowerCase();

        return (
          guestName.includes(q) ||
          guestEmail.includes(q) ||
          comment.includes(q) ||
          roomName.includes(q) ||
          bookingCode.includes(q)
        );
      }

      return true;
    });
  }, [reviews, selectedRoom, selectedRating, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return { total: 0, avg: 0, highSatPercent: 0, topRoom: '-' };
    }

    const sumRating = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    const avg = (sumRating / total).toFixed(1);

    const highSatCount = reviews.filter((r) => Number(r.rating) >= 4).length;
    const highSatPercent = Math.round((highSatCount / total) * 100);

    // Group by room
    const roomCounts = {};
    reviews.forEach((r) => {
      const name = r.room_types?.name || 'General';
      roomCounts[name] = (roomCounts[name] || 0) + 1;
    });

    let topRoom = '-';
    let maxCount = 0;
    Object.entries(roomCounts).forEach(([name, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topRoom = name;
      }
    });

    return { total, avg, highSatPercent, topRoom };
  }, [reviews]);

  // Delete review handler
  const handleDeleteReview = async (id) => {
    const result = await Swal.fire({
      title: t('adm_rev_delete_confirm') || 'Delete this review?',
      text: t('adm_rev_delete_text') || 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: t('adm_rev_delete_btn') || 'Delete',
      cancelButtonText: t('pm_cancel') || 'Cancel',
      background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#0f172a'
    });

    if (!result.isConfirmed) return;

    setDeletingId(id);
    try {
      const res = await api.delete(`/reviews/${id}`);
      if (res.data?.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        Swal.fire({
          icon: 'success',
          title: t('adm_rev_delete_success') || 'Review deleted successfully',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
          color: document.documentElement.classList.contains('dark') ? '#fff' : '#0f172a'
        });
      }
    } catch (err) {
      console.error('Delete review error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to delete review',
        background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#0f172a'
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shadow-sm">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t('adm_reviews_title')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            {t('adm_reviews_sub')}
          </p>
        </div>

        <button
          onClick={fetchReviewsAndRooms}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold rounded-xl transition shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Reviews */}
        <div className="bg-white dark:bg-[#0f172a] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-400">
              {t('adm_rev_total')}
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {stats.total}
            </h3>
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white dark:bg-[#0f172a] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-400">
              {t('adm_rev_avg_rating')}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.avg}
              </h3>
              <span className="text-xs text-amber-500 font-bold">/ 5.0</span>
            </div>
          </div>
        </div>

        {/* High Satisfaction */}
        <div className="bg-white dark:bg-[#0f172a] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-400">
              {t('adm_rev_satisfaction')}
            </p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {stats.highSatPercent}%
            </h3>
          </div>
        </div>

        {/* Most Reviewed Room */}
        <div className="bg-white dark:bg-[#0f172a] p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center flex-shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-400 truncate">
              {t('adm_rev_top_room')}
            </p>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5" title={stats.topRoom}>
              {stats.topRoom}
            </h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0f172a] p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Room Type Filter */}
          <div className="relative min-w-[200px]">
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-amber-500/30 transition appearance-none cursor-pointer"
            >
              <option value="all">{t('adm_rev_all_rooms')}</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
            <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Rating Filter */}
          <div className="relative min-w-[150px]">
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-amber-500/30 transition appearance-none cursor-pointer"
            >
              <option value="all">{t('adm_rev_all_ratings')}</option>
              <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
              <option value="4">⭐⭐⭐⭐ 4 Stars</option>
              <option value="3">⭐⭐⭐ 3 Stars</option>
              <option value="2">⭐⭐ 2 Stars</option>
              <option value="1">⭐ 1 Star</option>
            </select>
            <Star className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none fill-amber-400" />
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px] md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('adm_rev_search')}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-500/30 transition"
          />
        </div>
      </div>

      {/* Reviews Cards List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading guest reviews...</p>
        </div>
      ) : filteredReviews.length > 0 ? (
        <div className="grid grid-cols-1 gap-5">
          {filteredReviews.map((rev) => {
            const guestName = rev.profiles?.full_name || 'Guest';
            const guestAvatar = rev.profiles?.avatar_url;
            const guestEmail = rev.profiles?.email;
            const roomName = rev.room_types?.name || 'Hotel Room';
            const roomSlug = rev.room_types?.slug;
            const roomImg = rev.room_types?.images?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80';
            const bookingCode = rev.bookings?.booking_code;
            const formattedDate = formatDateDDMMYY(rev.created_at);

            return (
              <div
                key={rev.id}
                className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-100 dark:border-slate-800 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-5 relative overflow-hidden"
              >
                {/* Top Row: Guest Info + Room Badge + Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Guest Info */}
                  <div className="flex items-center gap-3.5">
                    {guestAvatar ? (
                      <img
                        src={guestAvatar}
                        alt={guestName}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-500/40 shadow-sm"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white font-bold text-base flex items-center justify-center shadow-sm">
                        {guestName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {guestName}
                        </h4>
                        {bookingCode && (
                          <span className="font-mono text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-lg">
                            {bookingCode}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {guestEmail || 'Registered Guest'} • <span className="font-medium text-slate-600 dark:text-slate-300">{formattedDate}</span>
                      </p>
                    </div>
                  </div>

                  {/* Room Type Badge & Action */}
                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl">
                      <img
                        src={roomImg}
                        alt={roomName}
                        className="w-7 h-7 rounded-lg object-cover"
                      />
                      <div className="text-left">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold leading-none">
                          {t('adm_rev_room_type')}
                        </p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                          {roomName}
                        </p>
                      </div>
                      {roomSlug && (
                        <Link
                          to={`/rooms/${roomSlug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-1 text-slate-400 hover:text-amber-500 transition"
                          title="View Room Page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      disabled={deletingId === rev.id}
                      className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition disabled:opacity-50"
                      title={t('adm_rev_delete_btn')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stars and Rating */}
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Number(rev.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200 dark:text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-black text-amber-500 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md">
                    {Number(rev.rating).toFixed(1)} / 5.0
                  </span>
                </div>

                {/* Guest Feedback & Management Note */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2 mb-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                    <MessageSquareQuote className="w-3.5 h-3.5" />
                    <span>{t('adm_rev_guest_feedback')}</span>
                  </div>
                  <p className="text-sm text-slate-800 dark:text-slate-200 italic leading-relaxed">
                    "{rev.comment || 'No text comment provided.'}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-100 dark:border-slate-800 p-12 text-center shadow-sm">
          <MessageSquareQuote className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
            {t('adm_rev_empty')}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or room type filter to view customer reviews.
          </p>
        </div>
      )}
    </div>
  );
}
