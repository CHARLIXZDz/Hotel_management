import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';

export default function AuthModal() {
  const { authModalOpen, authModalMode, openAuthModal, closeAuthModal, signIn, signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (authModalMode === 'signin') {
        await signIn(email, password);
        closeAuthModal();
      } else {
        await signUp(email, password, fullName, phone);
        setSuccessMsg('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ หรือยืนยันอีเมลหากมีการตั้งค่าไว้');
        setTimeout(() => {
          openAuthModal('signin');
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 md:p-8">
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            {authModalMode === 'signin' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิกใหม่'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {authModalMode === 'signin'
              ? 'ยินดีต้อนรับกลับสู่ Grand Horizon Hotel'
              : 'สมัครเพื่อรับสิทธิประโยชน์และจองห้องพักสุดพิเศษ'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalMode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  ชื่อ - นามสกุล
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="สมชาย ใจดี"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  เบอร์โทรศัพท์
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812345678"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              อีเมล (Email)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-medium text-sm rounded-xl shadow-lg shadow-primary-500/25 transition disabled:opacity-50"
          >
            {loading ? 'กำลังประมวลผล...' : authModalMode === 'signin' ? 'เข้าสู่ระบบ' : 'ลงทะเบียน'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          {authModalMode === 'signin' ? (
            <p>
              ยังไม่มีบัญชีผู้ใช้?{' '}
              <button
                type="button"
                onClick={() => openAuthModal('signup')}
                className="font-semibold text-primary-600 hover:text-primary-700 hover:underline"
              >
                สมัครสมาชิกใหม่
              </button>
            </p>
          ) : (
            <p>
              มีบัญชีผู้ใช้อยู่แล้ว?{' '}
              <button
                type="button"
                onClick={() => openAuthModal('signin')}
                className="font-semibold text-primary-600 hover:text-primary-700 hover:underline"
              >
                เข้าสู่ระบบ
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
