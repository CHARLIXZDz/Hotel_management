# 🏨 Grand Horizon Resort & Hotel - Booking & Management System

ระบบเว็บไซต์จองห้องพักโรงแรมแบบ Full-Stack พร้อมระบบจัดการหลังบ้าน (Admin Dashboard) ครบวงจร พัฒนาด้วย **React + Node.js (Express) + Supabase (PostgreSQL & Auth)**

---

## 🌟 ฟีเจอร์เด่นของระบบ

### 👤 ฝั่งลูกค้า (Guest / Customer)
- **หน้าแรกและระบบค้นหา:** เลือกวัน Check-in / Check-out และจำนวนผู้เข้าพักเพื่อกรองห้องว่างแบบเรียลไทม์
- **รายละเอียดห้องพัก:** แกลเลอรีรูปภาพ สิ่งอำนวยความสะดวก รายละเอียดห้องพัก และรีวิวจากผู้เข้าพักจริง
- **ระบบสมาชิก (Supabase Auth):** สมัครสมาชิกและเข้าสู่ระบบด้วย Email & Password
- **ระบบจองห้องพัก (Pay at Property):** จองสะดวกโดยไม่ต้องตัดบัตรเครดิตล่วงหน้า ชำระเงินเมื่อเดินทางถึงที่พัก
- **ประวัติการจองของฉัน:** ดูรายการจอง รหัสการจอง และสถานะห้องพัก
- **ระบบรีวิวและให้คะแนนดาว:** ลูกค้าที่เข้าพักเสร็จสิ้น (Checked Out) สามารถเขียนรีวิวและให้ดาวได้

### 🛠️ ฝั่งผู้ดูแลระบบ (Admin Dashboard)
- **สรุปภาพรวม (Overview Analytics):** สถิติยอดจองทั้งหมด รายได้ที่เก็บแล้ว จำนวนแขกที่กำลังพัก และรายการจองล่าสุด
- **จัดการประเภทห้องพัก (Room Management):** เพิ่ม ลบ แก้ไข ประเภทห้องพัก กำหนดราคา ความจุ และจำนวนห้อง
- **จัดการรายการจอง (Booking Management):** ค้นหารายการจอง และอัปเดตสถานะแบบเรียลไทม์ (Check-in, Check-out, Cancel)

---

## 🏗️ โครงสร้างโปรเจกต์ (Monorepo)

```text
Project_bodjob_loun_nrng/
├── client/                     # Frontend (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Navbar, Footer, RoomCard, AuthModal
│   │   ├── context/            # AuthContext (Supabase Auth state)
│   │   ├── pages/              # Home, RoomDetail, Checkout, MyBookings
│   │   │   └── admin/          # AdminLayout, AdminDashboard, AdminRooms, AdminBookings
│   │   └── services/           # Supabase client & Axios API instance
├── server/                     # Backend API (Node.js + Express)
│   └── src/
│       ├── controllers/        # room, booking, review, stat controllers
│       ├── middleware/         # auth & admin middleware
│       ├── routes/             # API endpoints
│       └── server.js
├── supabase/
│   └── schema.sql              # สคริปต์ SQL สร้างตาราง, RLS Policies และ Seed Data
├── package.json
└── README.md
```

---

## 🚀 วิธีการติดตั้งและเริ่มต้นใช้งาน

### 1. ตั้งค่าฐานข้อมูล Supabase
1. เข้าไปที่ [Supabase Dashboard](https://supabase.com/) แล้วสร้างโปรเจกต์ใหม่
2. ไปที่เมนู **SQL Editor** ใน Supabase
3. คัดลอกโค้ดทั้งหมดจากไฟล์ `supabase/schema.sql` ไปวางแล้วกด **Run**
4. ข้อมูลตาราง `profiles`, `room_types`, `bookings`, `reviews` พร้อมข้อมูลห้องพักตัวอย่างจะถูกสร้างขึ้นทันที

### 2. ตั้งค่าไฟล์ Environment (.env)

#### ฝั่ง Backend (`server/.env`):
สร้างไฟล์ `server/.env` โดยคัดลอกรูปแบบจาก `server/.env.example`:
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
CLIENT_URL=http://localhost:5173
```

#### ฝั่ง Frontend (`client/.env`):
สร้างไฟล์ `client/.env` โดยคัดลอกรูปแบบจาก `client/.env.example`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000/api
```

### 3. ติดตั้ง Dependencies และรันระบบ

เปิด Terminal ในโฟลเดอร์หลัก:

```bash
# 1. ติดตั้ง dependencies และรัน Server
cd server
npm install
npm run dev

# 2. ในอีก Terminal หนึ่ง ติดตั้ง dependencies และรัน Client
cd client
npm install
npm run dev
```

* Frontend จะเปิดทำงานที่: `http://localhost:5173`
* Backend API จะทำงานที่: `http://localhost:5000`

---

## 👑 วิธีตั้งค่าสิทธิ์ Admin
1. สมัครสมาชิกผ่านหน้าเว็บตามปกติ
2. ไปที่ Supabase Dashboard > **Table Editor** > เลือกตาราง `profiles`
3. แก้ไขคอลัมน์ `role` ของผู้ใช้คนนั้นจาก `guest` เป็น `admin`
4. เมื่อรีเฟรชหน้าเว็บ คุณจะเห็นเมนู **"ระบบจัดการหลังบ้าน (Admin)"** ใน Navbar ทันที
