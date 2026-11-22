import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDateDDMMYY } from '../utils/date';
import {
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ChevronLeft
} from 'lucide-react';

export default function BookingCheckout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { t } = useLanguage();

  const roomId = searchParams.get('roomId');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const numGuests = searchParams.get('guests') || '2';
  const numRooms = searchParams.get('rooms') || '1';

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    if (user) {
      setGuestName(profile?.full_name || user.user_metadata?.full_name || '');
      setGuestEmail(user.email || '');
      setGuestPhone(profile?.phone || user.user_metadata?.phone || '');
    }
  }, [user, profile]);

  useEffect(() => {
    if (!roomId) {
      navigate('/');
      return;
    }

    const fetchRoom = async () => {
      try {
        const res = await api.get(`/rooms/${roomId}`);
        if (res.data?.success) {
          setRoom(res.data.data);
        }
      } catch (err) {
        console.error('Fetch room error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomId, navigate]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 text-sm">Loading reservation...</p>
      </div>
    );
  }

  if (!room) return null;

  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  const totalNights = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
  const totalPrice = parseFloat(room.price_per_night) * totalNights * parseInt(numRooms, 10);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const payload = {
        room_type_id: room.id,
        check_in: checkIn,
        check_out: checkOut,
        num_guests: parseInt(numGuests, 10),
        num_rooms: parseInt(numRooms, 10),
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
        special_requests: specialRequests
      };

      const res = await api.post('/bookings', payload);

      if (res.data?.success) {
        navigate('/my-bookings', {
          state: {
            newBookingCode: res.data.data.booking_code,
            successMessage: 'Reservation confirmed successfully! Payment is due at property upon arrival.'
          }
        });
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      setErrorMsg(err.response?.data?.message || 'Could not complete booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{t('detail_back')}</span>
        </button>

        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
          {t('co_title')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          {t('co_desc')}
        </p>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Guest Details Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmitBooking} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                {t('co_guest_info')}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {t('co_full_name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {t('co_phone')}
                  </label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+84 90 123 4567"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {t('co_email')}
                </label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {t('co_special_req')}
                </label>
                <textarea
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="High floor, twin beds, or estimated arrival time..."
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                ></textarea>
              </div>

              {/* Payment Method */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">{t('co_pay_method_title')}</h3>
                <div className="p-4 bg-primary-50/50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 rounded-2xl flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-primary-600 bg-primary-600 text-white flex items-center justify-center mt-0.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('detail_pay_guarantee_title')}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {t('co_pay_method_desc')}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-base rounded-2xl shadow-xl shadow-primary-600/25 transition disabled:opacity-50"
              >
                {submitting ? 'Processing reservation...' : t('co_submit_btn')}
              </button>
            </form>
          </div>

          {/* Right: Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                {t('co_summary_title')}
              </h2>

              <div className="flex gap-4">
                <img
                  src={room.images?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80'}
                  alt={room.name}
                  className="w-24 h-20 rounded-xl object-cover flex-shrink-0"
                />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{room.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{room.bed_type}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{numRooms} {t('detail_room_unit')}, {numGuests} Guests</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('search_checkin')}:</span>
                  <span className="font-semibold">{formatDateDDMMYY(checkIn)} {t('co_checkin_time')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('search_checkout')}:</span>
                  <span className="font-semibold">{formatDateDDMMYY(checkOut)} {t('co_checkout_time')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('co_duration')}</span>
                  <span className="font-semibold">{totalNights} {t('co_nights')}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>฿{Number(room.price_per_night).toLocaleString()} × {totalNights} {t('co_nights')}</span>
                  <span className="font-medium text-slate-900 dark:text-white">฿{(room.price_per_night * totalNights).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{t('detail_room_count')}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{numRooms} {t('detail_room_unit')}</span>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{t('co_due_at_hotel')}</span>
                  <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">฿{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200/60 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
                <p className="font-semibold mb-1">{t('co_policy_title')}</p>
                <p>{t('co_policy_desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
