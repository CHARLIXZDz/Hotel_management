import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Bed,
  Maximize2,
  Calendar,
  CheckCircle,
  Star,
  ShieldCheck,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';

export default function RoomDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Dates state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);

  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || tomorrow.toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || dayAfter.toISOString().split('T')[0]);
  const [numRooms, setNumRooms] = useState(1);
  const [numGuests, setNumGuests] = useState(searchParams.get('guests') || '2');

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
        <p className="text-slate-500 text-sm">กำลังโหลดข้อมูลห้องพัก...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-xl font-bold text-slate-800">ไม่พบห้องพักที่ท่านต้องการ</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm"
        >
          กลับสู่หน้าแรก
        </button>
      </div>
    );
  }

  // Calculate nights and total price
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

  const images = room.images && room.images.length > 0
    ? room.images
    : ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'];

  return (
    <div className="min-h-screen bg-slate-50 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary-600 mb-6 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>ย้อนกลับ</span>
        </button>

        {/* Room Header Title & Rating */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600">
              Luxury Accommodation
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
              {room.name}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {room.avg_rating || '5.0'} ({room.review_count || 0} รีวิวจากผู้เข้าพัก)
              </span>
              <span>•</span>
              <span>{room.bed_type}</span>
              <span>•</span>
              <span>{room.size_sqm} ตร.ม.</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">ราคาเริ่มต้นต่อคืน</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900">
                ฿{Number(room.price_per_night).toLocaleString()}
              </span>
              <span className="text-sm text-slate-500">/ คืน</span>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
          {/* Main Large Image */}
          <div className="lg:col-span-2 aspect-[16/10] rounded-3xl overflow-hidden bg-slate-200 shadow-md">
            <img
              src={images[activeImageIndex]}
              alt={room.name}
              className="w-full h-full object-cover transition duration-300"
            />
          </div>

          {/* Thumbnails */}
          <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative flex-1 aspect-[16/10] rounded-2xl overflow-hidden border-2 transition ${
                  activeImageIndex === idx ? 'border-primary-600 scale-[1.02]' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="room thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid: Details (Left) + Booking Box (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Room Specs, Amenities, Reviews */}
          <div className="lg:col-span-2 space-y-10">
            {/* Description */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">เกี่ยวกับห้องพักนี้</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {room.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100 text-sm text-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">รองรับสูงสุด</span>
                    <span className="font-semibold">{room.capacity} ท่าน</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary-600">
                    <Bed className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">รูปแบบเตียง</span>
                    <span className="font-semibold">{room.bed_type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary-600">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">ขนาดห้อง</span>
                    <span className="font-semibold">{room.size_sqm} ตร.ม.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">สิ่งอำนวยความสะดวกในห้อง</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(room.amenities || []).map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">รีวิวจากผู้เข้าพักจริง</h2>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-semibold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{room.avg_rating || '5.0'} / 5.0</span>
                </div>
              </div>

              {room.reviews && room.reviews.length > 0 ? (
                <div className="space-y-6">
                  {room.reviews.map((rev) => (
                    <div key={rev.id} className="pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm text-slate-800">
                          {rev.profiles?.full_name || 'ผู้เข้าพัก'}
                        </span>
                        <div className="flex items-center text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                      <span className="text-[10px] text-slate-400 mt-2 block">
                        {new Date(rev.created_at).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">ยังไม่มีรีวิวสำหรับห้องพักนี้</p>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Booking Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl space-y-6">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">สรุปราคาจอง</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-slate-900">
                    ฿{Number(room.price_per_night).toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500">/ คืน</span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                {/* Check-in */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    วันที่เช็คอิน (Check-in)
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Check-out */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    วันที่เช็คเอาท์ (Check-out)
                  </label>
                  <input
                    type="date"
                    min={checkIn}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Guests */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      ผู้เข้าพัก
                    </label>
                    <select
                      value={numGuests}
                      onChange={(e) => setNumGuests(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {[...Array(room.capacity)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1} ท่าน</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      จำนวนห้อง
                    </label>
                    <select
                      value={numRooms}
                      onChange={(e) => setNumRooms(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {[1, 2, 3].map((n) => (
                        <option key={n} value={n}>{n} ห้อง</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Price Calculation breakdown */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>฿{Number(room.price_per_night).toLocaleString()} × {totalNights} คืน × {numRooms} ห้อง</span>
                  <span className="font-semibold text-slate-900">฿{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>ค่าบริการ & ภาษี</span>
                  <span>ฟรี (รวมแล้ว)</span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">ยอดรวมทั้งสิ้น</span>
                  <span className="text-2xl font-extrabold text-primary-700">฿{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Policy Guarantee Banner */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800">
                <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-bold">ชำระเงินเมื่อเดินทางถึงที่พัก (Pay at Property)</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">ไม่ต้องตัดบัตร จองล็อกห้องทันที</p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleProceedToBooking}
                className="w-full py-3.5 px-4 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary-600/30 transition flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
              >
                <span>{user ? 'ดำเนินการจองห้องพัก' : 'เข้าสู่ระบบเพื่อทำการจอง'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
