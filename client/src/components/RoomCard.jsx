import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { Users, Maximize2, Bed, Star, ArrowRight, Flame, Zap } from 'lucide-react';

export default function RoomCard({ room, searchParams, index = 0 }) {
  const { t } = useLanguage();
  const imageUrl = room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80';

  const queryParams = new URLSearchParams();
  if (searchParams?.checkIn) queryParams.set('checkIn', searchParams.checkIn);
  if (searchParams?.checkOut) queryParams.set('checkOut', searchParams.checkOut);
  if (searchParams?.guests) queryParams.set('guests', searchParams.guests);

  const detailUrl = `/rooms/${room.slug || room.id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const isPopular = room.price_per_night >= 3000 || room.capacity >= 4;
  const isLimited = room.available_rooms !== undefined && room.available_rooms > 0 && room.available_rooms <= 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      whileHover={{ y: -6 }}
      className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col group relative"
    >
      {/* Image Banner with subtle zoom */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={imageUrl}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Floating Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
          {/* Availability Badge */}
          {room.available_rooms !== undefined && (
            <div>
              {room.available_rooms > 0 ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{t('rooms_available', { count: room.available_rooms })}</span>
                </span>
              ) : (
                <span className="px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded-full shadow-sm">
                  {t('rooms_soldout')}
                </span>
              )}
            </div>
          )}

          {/* Social Proof: Popular Tag */}
          {isPopular && (
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold rounded-full shadow-sm">
                <Flame className="w-3 h-3 fill-white" />
                <span>{t('badge_popular')}</span>
              </span>
            </div>
          )}

          {/* Urgency: Only X left */}
          {isLimited && (
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-500 text-white text-[11px] font-bold rounded-full shadow-sm animate-pulse">
                <Zap className="w-3 h-3 fill-white" />
                <span>{t('badge_limited', { count: room.available_rooms })}</span>
              </span>
            </div>
          )}
        </div>

        {/* Rating Badge */}
        {room.avg_rating && (
          <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 bg-slate-900/85 backdrop-blur-md text-white text-xs font-semibold rounded-full shadow-md z-10">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{room.avg_rating}</span>
            <span className="text-slate-400 text-[10px]">({room.review_count})</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition">
            {room.name}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
            {room.description}
          </p>

          {/* Key Specs */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              <span>{t('rooms_max_guests', { count: room.capacity })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-slate-400" />
              <span>{room.bed_type}</span>
            </div>
            {room.size_sqm && (
              <div className="flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4 text-slate-400" />
                <span>{t('rooms_size', { size: room.size_sqm })}</span>
              </div>
            )}
          </div>
        </div>

        {/* Price & Action */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">{t('rooms_price_start')}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                ฿{Number(room.price_per_night).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{t('rooms_per_night')}</span>
            </div>
          </div>

          <Link
            to={detailUrl}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white font-medium text-sm transition group/btn"
          >
            <span>{t('rooms_view_details')}</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
