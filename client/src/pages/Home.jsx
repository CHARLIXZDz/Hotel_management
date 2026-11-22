import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import RoomCard from '../components/RoomCard';
import {
  Calendar,
  Users,
  Search,
  Wifi,
  Coffee,
  Waves,
  ShieldCheck,
  Sparkles,
  MapPin,
  Clock,
  Check
} from 'lucide-react';

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default dates: tomorrow to day after tomorrow
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
  const [isSearching, setIsSearching] = useState(false);

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
    setIsSearching(true);
    fetchRooms({ checkIn, checkOut, guests });
    // Scroll smoothly to rooms section
    const el = document.getElementById('rooms');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center bg-slate-900 text-white overflow-hidden">
        {/* Background Image with Dark Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85"
            alt="Luxury Resort Resort"
            className="w-full h-full object-cover object-center opacity-40 scale-105 animate-pulse-slow"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 pb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-amber-300 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>พักผ่อนเหนือระดับ ณ หาดอ่าวนาง กระบี่</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-snug">
            ค้นพบความสุขแห่งการพักผ่อน <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-primary-200 to-amber-200">
              ณ Grand Horizon Resort
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-200 max-w-2xl mx-auto font-light leading-relaxed">
            จองห้องพักวิลล่าและสวีทสุดหรูริมทะเลวันนี้ ชำระเงินเมื่อเข้าพัก การันตีราคาดีที่สุดพร้อมบริการระดับ 5 ดาว
          </p>

          {/* Quick Search Floating Box */}
          <div className="mt-10 max-w-4xl mx-auto bg-white/95 backdrop-blur-xl p-4 sm:p-5 rounded-3xl shadow-2xl border border-white/40 text-slate-800">
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              {/* Check-in */}
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary-600" />
                  วันที่เช็คอิน (Check-in)
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
                  className="w-full px-3.5 py-2.5 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                />
              </div>

              {/* Check-out */}
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary-600" />
                  วันที่เช็คเอาท์ (Check-out)
                </label>
                <input
                  type="date"
                  required
                  min={checkIn}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                />
              </div>

              {/* Guests */}
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary-600" />
                  จำนวนผู้เข้าพัก
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                >
                  <option value="1">1 ท่าน (Solo)</option>
                  <option value="2">2 ท่าน (Couple)</option>
                  <option value="3">3 ท่าน (Family/Friends)</option>
                  <option value="4">4 ท่าน (Family Suite)</option>
                </select>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="w-full h-11 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold text-sm rounded-xl shadow-lg shadow-primary-600/30 transition transform hover:-translate-y-0.5"
                >
                  <Search className="w-4 h-4" />
                  <span>ค้นหาห้องว่าง</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. Key Highlights Banner */}
      <section className="bg-white border-b border-slate-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex items-center justify-center gap-3">
              <ShieldCheck className="w-8 h-8 text-primary-600 flex-shrink-0" />
              <div className="text-left">
                <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider">Pay at Hotel</h4>
                <p className="text-xs text-slate-500">ไม่ต้องจ่ายล่วงหน้า ชำระวันพัก</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Clock className="w-8 h-8 text-primary-600 flex-shrink-0" />
              <div className="text-left">
                <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider">Instant Confirmation</h4>
                <p className="text-xs text-slate-500">จองเสร็จรับรหัสยืนยันทันที</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Coffee className="w-8 h-8 text-primary-600 flex-shrink-0" />
              <div className="text-left">
                <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider">Free Breakfast</h4>
                <p className="text-xs text-slate-500">อาหารเช้าพรีเมียมทุกห้อง</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Wifi className="w-8 h-8 text-primary-600 flex-shrink-0" />
              <div className="text-left">
                <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider">Ultra High-Speed Wi-Fi</h4>
                <p className="text-xs text-slate-500">อินเทอร์เน็ตฟรีทั่วรีสอร์ต</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Rooms Section */}
      <section id="rooms" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-600">
            Accommodations
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            ห้องพักและวิลล่าสำหรับคุณ
          </h2>
          <p className="text-slate-500 text-sm mt-3">
            เลือกประเภทห้องพักที่ตรงใจ พร้อมอุปกรณ์และสิ่งอำนวยความสะดวกครบครันเพื่อวันพักผ่อนที่สมบูรณ์แบบ
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-96 animate-pulse border border-slate-100"></div>
            ))}
          </div>
        ) : rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                searchParams={{ checkIn, checkOut, guests }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-600 font-medium">ไม่พบห้องพักว่างตามช่วงเวลาที่ท่านระบุ</p>
            <p className="text-xs text-slate-400 mt-1">กรุณาทดลองเปลี่ยนวันที่ หรือลดจำนวนผู้เข้าพัก</p>
          </div>
        )}
      </section>

      {/* 4. Resort Amenities Section */}
      <section id="amenities" className="py-16 bg-slate-100 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600">
              World-Class Facilities
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              สิ่งอำนวยความสะดวกภายในโรงแรม
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
              <div className="w-14 h-14 bg-sky-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Waves className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Infinity Pool ริมทะเล</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                สระว่ายน้ำไร้ขอบวิวทะเลกว้าง 180 องศา ให้คุณผ่อนคลายพร้อมชมพระอาทิตย์ตกดินสุดโรแมนติก
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Coffee className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Horizon Restaurant & Bar</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                ลิ้มรสอาหารไทยต้นตำรับและอาหารตะวันตก โดยเชฟมือรางวัล พร้อมค็อกเทลสูตรพิเศษริมหาด
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Serenity Wellness Spa</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                การบำบัดด้วยสมุนไพรธรรมชาติและการนวดแผนไทยเพื่อคืนความสดชื่นและความผ่อนคลายสูงสุด
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
