import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
];

export default function LiveSocialProof() {
  const { language, t } = useLanguage();
  const [bookingsList, setBookingsList] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // 1. Fetch real bookings from Supabase database
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await api.get('/bookings/recent-social');
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const mapped = res.data.data.map((b, i) => ({
            id: b.id,
            guestName: b.guest_name,
            roomName: b.room_types?.name || 'Grand Horizon Suite',
            createdAt: b.created_at,
            avatar: DEFAULT_AVATARS[i % DEFAULT_AVATARS.length]
          }));
          setBookingsList(mapped);
        }
      } catch (err) {
        // Fallback handled gracefully
      }
    };
    fetchRecent();
  }, []);

  // 2. Loop notification toast
  useEffect(() => {
    if (dismissed || bookingsList.length === 0) return;

    const firstTimer = setTimeout(() => {
      setVisible(true);
    }, 3500);

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % bookingsList.length);
        setVisible(true);
      }, 2500);
    }, 12000);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, [dismissed, bookingsList]);

  if (bookingsList.length === 0) return null;

  const current = bookingsList[currentIdx] || bookingsList[0];

  // Helper for relative time in 3 languages
  const getRelativeTime = (isoString) => {
    if (!isoString) return language === 'vi' ? 'vừa xong' : language === 'lo' ? 'ຫາກໍ່ຈອງ' : 'just now';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffMinutes < 5) {
      if (language === 'vi') return 'vừa đặt xong';
      if (language === 'lo') return 'ຫາກໍ່ຈອງ';
      return 'just booked';
    }
    if (diffMinutes < 60) {
      if (language === 'vi') return `${diffMinutes} phút trước`;
      if (language === 'lo') return `${diffMinutes} ນາທີກ່ອນ`;
      return `${diffMinutes} mins ago`;
    }
    if (diffHours < 24) {
      if (language === 'vi') return `${diffHours} giờ trước`;
      if (language === 'lo') return `${diffHours} ຊົ່ວໂມງກ່ອນ`;
      return `${diffHours} hour(s) ago`;
    }
    if (language === 'vi') return 'hôm nay';
    if (language === 'lo') return 'ມື້ນີ້';
    return 'today';
  };

  const getBookedText = () => {
    if (language === 'vi') return 'vừa đặt';
    if (language === 'lo') return 'ຫາກໍ່ຈອງ';
    return 'just booked';
  };

  const getVerifiedText = () => {
    if (language === 'vi') return 'Đặt phòng thật từ hệ thống';
    if (language === 'lo') return 'ການຈອງແທ້ຈາກລະບົບ';
    return 'Verified Real Booking';
  };

  return (
    <div className="fixed bottom-5 left-5 z-40 max-w-sm pointer-events-none">
      <AnimatePresence>
        {visible && !dismissed && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xl flex items-center gap-3.5 text-slate-800 dark:text-slate-100"
          >
            {/* Guest Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={current.avatar}
                alt={current.guestName}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-primary-500/30"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                <ShieldCheck className="w-2.5 h-2.5 text-white" />
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                <span className="font-bold text-slate-900 dark:text-white">{current.guestName}</span> {getBookedText()}
              </p>
              <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 truncate mt-0.5">
                {current.roomName}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                <span>{getRelativeTime(current.createdAt)}</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                  ✓ {getVerifiedText()}
                </span>
              </div>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => setDismissed(true)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
