import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const RECENT_BOOKINGS = [
  {
    nameLo: 'ສົມໄຊ (ນະຄອນຫຼວງວຽງຈັນ)',
    nameVi: 'Nguyễn Văn Minh (Hà Nội)',
    nameEn: 'Somxay (Vientiane)',
    roomLo: 'Deluxe Ocean View',
    roomVi: 'Deluxe Ocean View',
    roomEn: 'Deluxe Ocean View',
    timeLo: '4 ນາທີກ່ອນ',
    timeVi: '4 phút trước',
    timeEn: '4 mins ago',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  },
  {
    nameLo: 'ດາວອນ (ຫຼວງພະບາງ)',
    nameVi: 'Trần Thị Mai (Đà Nẵng)',
    nameEn: 'David M. (London, UK)',
    roomLo: 'Beachfront Private Villa',
    roomVi: 'Beachfront Private Villa',
    roomEn: 'Beachfront Private Villa',
    timeLo: '12 ນາທີກ່ອນ',
    timeVi: '12 phút trước',
    timeEn: '12 mins ago',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  },
  {
    nameLo: 'ຄຳຫຼ້າ (ຈຳປາສັກ)',
    nameVi: 'Lê Hoàng (TP. Hồ Chí Minh)',
    nameEn: 'Sophie L. (Paris, France)',
    roomLo: 'Presidential Royal Suite',
    roomVi: 'Presidential Royal Suite',
    roomEn: 'Presidential Royal Suite',
    timeLo: '27 ນາທີກ່ອນ',
    timeVi: '27 phút trước',
    timeEn: '27 mins ago',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
  }
];

export default function LiveSocialProof() {
  const { lang, t } = useLanguage();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    // Show first toast after 4s
    const firstTimer = setTimeout(() => {
      setVisible(true);
    }, 4000);

    // Loop toast every 14s (shows for 5.5s, hides for 8.5s)
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % RECENT_BOOKINGS.length);
        setVisible(true);
      }, 3000);
    }, 14000);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, [dismissed]);

  const current = RECENT_BOOKINGS[currentIdx];

  const getName = () => {
    if (lang === 'lo') return current.nameLo;
    if (lang === 'vi') return current.nameVi;
    return current.nameEn;
  };

  const getRoom = () => {
    if (lang === 'lo') return current.roomLo;
    if (lang === 'vi') return current.roomVi;
    return current.roomEn;
  };

  const getTime = () => {
    if (lang === 'lo') return current.timeLo;
    if (lang === 'vi') return current.timeVi;
    return current.timeEn;
  };

  const getBookedText = () => {
    if (lang === 'lo') return 'ຫາກໍ່ຈອງ';
    if (lang === 'vi') return 'vừa đặt';
    return 'just booked';
  };

  const getVerifiedText = () => {
    if (lang === 'lo') return 'ການຈองທີ່ຢັ້ງຢືນແລ້ວ';
    if (lang === 'vi') return 'Đặt phòng đã xác thực';
    return 'Verified Booking';
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
                alt="Guest"
                className="w-11 h-11 rounded-full object-cover ring-2 ring-primary-500/30"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                <ShieldCheck className="w-2.5 h-2.5 text-white" />
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                <span className="font-bold text-slate-900 dark:text-white">{getName()}</span> {getBookedText()}
              </p>
              <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 truncate mt-0.5">
                {getRoom()}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                <span>{getTime()}</span>
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
