import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  Lock
} from 'lucide-react';

export default function BookingCheckout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const roomId = searchParams.get('roomId');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const numGuests = searchParams.get('guests') || '2';
  const numRooms = searchParams.get('rooms') || '1';

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Guest details form state
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
        <p className="text-slate-500 text-sm">กำลังเตรียมข้อมูลการจอง...</p>
      </div>
    );
  }

  if (!room) {
    return null;
  }

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
        // Successfully booked! Navigate to my-bookings page with success state
        navigate('/my-bookings', {
          state: {
            newBookingCode: res.data.data.booking_code,
            successMessage: 'ยินดีด้วย! การจองของคุณเสร็จสมบูรณ์เรียบร้อยแล้ว ชำระเงิน ณ วันเข้าพัก'
          }
        });
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      setErrorMsg(err.response?.data?.message || 'ไม่สามารถทำการจองได้ กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary-600 mb-6 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>ย้อนกลับไปแก้ไข</span>
        </button>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          ยืนยันการจองห้องพัก
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          กรุณาตรวจสอบข้อมูลผู้เข้าพักและรายละเอียดการจองก่อนกดยืนยัน
        </p>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Guest Details Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmitBooking} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
                ข้อมูลผู้เข้าพักหลัก
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    ชื่อ - นามสกุล *
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="นายสมชาย ใจดี"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    เบอร์โทรศัพท์ติดต่อ *
                  </label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="0812345678"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  อีเมลยืนยันการจอง *
                </label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="somchai@example.com"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  คำขอพิเศษเพิ่มเติม (ถ้ามี)
                </label>
                <textarea
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="เช่น ขอห้องพักชั้นสูง, ขอเตียงคู่, หรือเวลาเดินทางถึงโดยประมาณ"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                ></textarea>
              </div>

              {/* Payment Method Option */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-3">วิธีการชำระเงิน</h3>
                <div className="p-4 bg-primary-50/50 border border-primary-200 rounded-2xl flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-primary-600 bg-primary-600 text-white flex items-center justify-center mt-0.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">ชำระเงินเมื่อเดินทางถึงที่พัก (Pay at Property)</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      ท่านสามารถชำระด้วยเงินสด บัตรเครดิต หรือสแกน QR Code พร้อมเพย์ ที่เคาน์เตอร์ต้อนรับของโรงแรมตอนเช็คอิน
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-base rounded-2xl shadow-xl shadow-primary-600/25 transition disabled:opacity-50"
              >
                {submitting ? 'กำลังบันทึกข้อมูลการจอง...' : 'ยืนยันการจองห้องพัก (ไม่ต้องจ่ายเงินตอนนี้)'}
              </button>
            </form>
          </div>

          {/* Right Column: Booking Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                สรุปรายการจอง
              </h2>

              <div className="flex gap-4">
                <img
                  src={room.images?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80'}
                  alt={room.name}
                  className="w-24 h-20 rounded-xl object-cover flex-shrink-0"
                />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{room.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{room.bed_type}</p>
                  <p className="text-xs text-slate-500">{numRooms} ห้อง, {numGuests} ท่าน</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl space-y-3 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">เช็คอิน:</span>
                  <span className="font-semibold">{checkIn} (14:00 น. เป็นต้นไป)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">เช็คเอาท์:</span>
                  <span className="font-semibold">{checkOut} (ก่อน 12:00 น.)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ระยะเวลาเข้าพัก:</span>
                  <span className="font-semibold">{totalNights} คืน</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>฿{Number(room.price_per_night).toLocaleString()} × {totalNights} คืน</span>
                  <span className="font-medium">฿{(room.price_per_night * totalNights).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>จำนวนห้อง</span>
                  <span className="font-medium">{numRooms} ห้อง</span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">ยอดชำระ ณ ที่พัก</span>
                  <span className="text-2xl font-extrabold text-primary-700">฿{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-[11px] text-amber-900 leading-relaxed">
                <p className="font-semibold mb-1">นโยบายการเข้าพัก:</p>
                <p>กรุณาแสดงรหัสการจองและบัตรประชาชน/พาสปอร์ต ณ วันเช็คอิน</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
