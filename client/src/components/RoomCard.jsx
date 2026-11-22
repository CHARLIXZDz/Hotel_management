import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Maximize2, Bed, Star, ArrowRight } from 'lucide-react';

export default function RoomCard({ room, searchParams }) {
  const imageUrl = room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80';

  const queryParams = new URLSearchParams();
  if (searchParams?.checkIn) queryParams.set('checkIn', searchParams.checkIn);
  if (searchParams?.checkOut) queryParams.set('checkOut', searchParams.checkOut);
  if (searchParams?.guests) queryParams.set('guests', searchParams.guests);

  const detailUrl = `/rooms/${room.slug || room.id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col group">
      {/* Image Banner */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />
        {/* Availability Badge */}
        {room.available_rooms !== undefined && (
          <div className="absolute top-4 left-4">
            {room.available_rooms > 0 ? (
              <span className="px-3 py-1 bg-white/95 backdrop-blur-md text-emerald-700 text-xs font-semibold rounded-full shadow-sm">
                ว่างเหลือ {room.available_rooms} ห้อง
              </span>
            ) : (
              <span className="px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded-full shadow-sm">
                เต็มแล้ว
              </span>
            )}
          </div>
        )}

        {/* Rating Badge */}
        {room.avg_rating && (
          <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-xs font-medium rounded-full">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{room.avg_rating}</span>
            <span className="text-slate-400 text-[10px]">({room.review_count})</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition">
            {room.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
            {room.description}
          </p>

          {/* Key Specs */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              <span>สูงสุด {room.capacity} ท่าน</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-slate-400" />
              <span>{room.bed_type}</span>
            </div>
            {room.size_sqm && (
              <div className="flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4 text-slate-400" />
                <span>{room.size_sqm} ตร.ม.</span>
              </div>
            )}
          </div>
        </div>

        {/* Price & Action */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">ราคาเริ่มต้น</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">
                ฿{Number(room.price_per_night).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">/ คืน</span>
            </div>
          </div>

          <Link
            to={detailUrl}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white font-medium text-sm transition"
          >
            <span>ดูรายละเอียด</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
