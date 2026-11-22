import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';

// Pages
import Home from './pages/Home';
import RoomDetail from './pages/RoomDetail';
import BookingCheckout from './pages/BookingCheckout';
import MyBookings from './pages/MyBookings';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRooms from './pages/admin/AdminRooms';
import AdminBookings from './pages/admin/AdminBookings';

// Public Layout wrapper with Navbar and Footer
function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <AuthModal />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public & Customer Facing Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/rooms/:id" element={<RoomDetail />} />
                <Route path="/checkout" element={<BookingCheckout />} />
                <Route path="/my-bookings" element={<MyBookings />} />
              </Route>

              {/* Dedicated Admin Portal Routes (Sidebar reaches top:0, independent header) */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="rooms" element={<AdminRooms />} />
                <Route path="bookings" element={<AdminBookings />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
