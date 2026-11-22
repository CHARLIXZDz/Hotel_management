import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck2,
  ArrowLeft,
  Hotel
} from 'lucide-react';

export default function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Guard: if not admin
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-slate-50">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mb-4">
          <Hotel className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">เข้าถึงไม่ได้ (Access Denied)</h2>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          หน้านี้สงวนสิทธิ์เฉพาะผู้ดูแลระบบ (Admin) โรงแรมเท่านั้น กรุณาล็อกอินด้วยบัญชีแอดมิน
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  const navItems = [
    { label: 'ภาพรวมระบบ (Overview)', path: '/admin', icon: LayoutDashboard },
    { label: 'จัดการรายการจอง (Bookings)', path: '/admin/bookings', icon: CalendarCheck2 },
    { label: 'จัดการประเภทห้องพัก (Rooms)', path: '/admin/rooms', icon: BedDouble },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 p-6 flex flex-col justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
              <Hotel className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">Admin Portal</h1>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                Hotel Management
              </span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 mt-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับสู่หน้าเว็บโรงแรม</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
