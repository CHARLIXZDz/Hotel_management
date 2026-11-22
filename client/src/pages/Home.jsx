import React, { useState, useEffect } from 'react';
import api from '../services/api';
import RoomCard from '../components/RoomCard';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Users,
  Search,
  Wifi,
  Coffee,
  Waves,
  ShieldCheck,
  Sparkles,
  Clock,
  Star,
  Award,
  Headphones,
  CheckCircle2
} from 'lucide-react';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2000&q=85',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=85'
];

export default function Home() {
  const { t } = useLanguage();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  // Auto rotate hero images every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const getDayAfterTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  };

  const [checkIn, setCheckIn] = useState(getTomorrow());
  const [checkOut, setCheckOut] = useState(getDayAfterTomorrow());
  const [guests, setGuests] = useState('2');

  const fetchRooms = async (searchParams = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchParams.checkIn) params.set('checkIn', searchParams.checkIn);
      if (searchParams.checkOut) params.set('checkOut', searchParams.checkOut);
      if (searchParams.guests) params.set('capacity', searchParams.guests);

      const res = await api.get(`/rooms?${params.toString()}`);
      if (res.data?.success) {
        setRooms(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms({ checkIn, checkOut, guests });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRooms({ checkIn, checkOut, guests });
    const el = document.getElementById('rooms');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* 1. Hero Section with Ken-Burns Cross-fade Background Slider */}
      <section className="relative min-h-[620px] lg:min-h-[700px] flex items-center justify-center bg-slate-950 text-white overflow-hidden">
        {/* Background Image Carousel */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={heroIndex}
              src={HERO_IMAGES[heroIndex]}
              alt="Luxury Resort Background"
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 0.45, scale: 1.02 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: 'easeInOut' }}
              className="w-full h-full object-cover object-center absolute inset-0"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-10 pb-24">
          {/* Animated Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-amber-300 mb-6 shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
            <span>{t('hero_badge')}</span>
          </motion.div>

          {/* Heading with generous line separation */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white"
          >
            <span className="block mb-3 sm:mb-5 leading-normal">
              {t('hero_title')}
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-primary-200 to-amber-200 py-1.5 leading-normal">
              {t('hero_title_sub')}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-slate-200 max-w-2xl mx-auto font-light leading-relaxed sm:leading-loose"
          >
            {t('hero_desc')}
          </motion.p>

          {/* Floating Search Bar with Elevation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 max-w-4xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 sm:p-5 rounded-3xl shadow-2xl border border-white/40 dark:border-slate-800 text-slate-800 dark:text-slate-100"
          >
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              {/* Check-in */}
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                  {t('search_checkin')}
                </label>
                <input
                  type="date"
                  required
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
                  className="w-full px-3.5 py-2.5 text-sm font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              {/* Check-out */}
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                  {t('search_checkout')}
                </label>
                <input
                  type="date"
                  required
                  min={checkIn}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              {/* Guests */}
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                  {t('search_guests')}
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="1">{t('search_guests_1')}</option>
                  <option value="2">{t('search_guests_2')}</option>
                  <option value="3">{t('search_guests_3')}</option>
                  <option value="4">{t('search_guests_4')}</option>
                </select>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="w-full h-11 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold text-sm rounded-xl shadow-lg shadow-primary-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Search className="w-4 h-4" />
                  <span>{t('search_btn')}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* 2. High-Impact Trust & Social Proof Counter Bar (Numbers & Badges) */}
      <section className="bg-white dark:bg-[#0c1322] border-b border-slate-200/80 dark:border-slate-800 py-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          >
            {/* Metric 1: Rating */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight block">
                  {t('trust_rating_val')}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {t('trust_rating_lbl')}
                </span>
              </div>
            </div>

            {/* Metric 2: Guests Served */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight block">
                  {t('trust_guests_val')}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {t('trust_guests_lbl')}
                </span>
              </div>
            </div>

            {/* Metric 3: Best Rate */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight block">
                  {t('trust_guarantee_val')}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {t('trust_guarantee_lbl')}
                </span>
              </div>
            </div>

            {/* Metric 4: 24/7 Concierge */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight block">
                  {t('trust_support_val')}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {t('trust_support_lbl')}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Rooms Section with Staggered Entrance */}
      <section id="rooms" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
            {t('rooms_badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
            {t('rooms_title')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-3">
            {t('rooms_desc')}
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white dark:bg-slate-900 rounded-3xl h-96 animate-pulse border border-slate-100 dark:border-slate-800"></div>
            ))}
          </div>
        ) : rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room, idx) => (
              <RoomCard
                key={room.id}
                room={room}
                index={idx}
                searchParams={{ checkIn, checkOut, guests }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-600 dark:text-slate-300 font-medium">{t('rooms_not_found')}</p>
            <p className="text-xs text-slate-400 mt-1">{t('rooms_not_found_sub')}</p>
          </div>
        )}
      </section>

      {/* 4. Resort Amenities Section */}
      <section id="amenities" className="py-20 bg-slate-100 dark:bg-slate-900/60 border-t border-slate-200/60 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-xl mx-auto mb-14"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
              {t('fac_badge')}
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {t('fac_title')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -6 }}
              className="bg-white dark:bg-[#0f172a] p-8 rounded-3xl shadow-sm hover:shadow-xl border border-slate-100 dark:border-slate-800 text-center transition-all duration-300"
            >
              <div className="w-14 h-14 bg-sky-50 dark:bg-sky-950/60 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Waves className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{t('fac_pool_title')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t('fac_pool_desc')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -6 }}
              className="bg-white dark:bg-[#0f172a] p-8 rounded-3xl shadow-sm hover:shadow-xl border border-slate-100 dark:border-slate-800 text-center transition-all duration-300"
            >
              <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Coffee className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{t('fac_rest_title')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t('fac_rest_desc')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -6 }}
              className="bg-white dark:bg-[#0f172a] p-8 rounded-3xl shadow-sm hover:shadow-xl border border-slate-100 dark:border-slate-800 text-center transition-all duration-300"
            >
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{t('fac_spa_title')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t('fac_spa_desc')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
