import React from 'react';
import { Hotel, Phone, Mail, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Column 1: Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white">
                <Hotel className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Grand Horizon</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              สัมผัสประสบการณ์การพักผ่อนระดับพรีเมียมริมชายหาด การันตีความสะดวกสบายและบริการอันอบอุ่นระดับ 5 ดาว
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">เมนูด่วน</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="/#rooms" className="hover:text-primary-400 transition">ห้องพักและวิลล่า</a></li>
              <li><a href="/#amenities" className="hover:text-primary-400 transition">บริการและสิ่งอำนวยความสะดวก</a></li>
              <li><a href="/#about" className="hover:text-primary-400 transition">เรื่องราวของเรา</a></li>
              <li><a href="/#contact" className="hover:text-primary-400 transition">ติดต่อเรา</a></li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">ข้อมูลติดต่อ</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary-400 mt-1 flex-shrink-0" />
                <span>888 ถนนเลียบหาด ตำบลอ่าวนาง อำเภอเมืองกระบี่ 81000</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span>+66 (0) 75 123 456</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span>reservation@grandhorizonhotel.com</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Policy & Payment Guarantee */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">นโยบายการจอง</h4>
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 space-y-2">
              <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                Pay at Property
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                จองออนไลน์ได้ทันทีโดยไม่ต้องชำระเงินล่วงหน้า ชำระเงินเมื่อเดินทางถึงโรงแรม ณ วันเข้าพัก
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Grand Horizon Resort & Hotel. สงวนลิขสิทธิ์ทุกประการ.</p>
          <p className="flex items-center gap-1">
            Built with React, Node.js & Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}
