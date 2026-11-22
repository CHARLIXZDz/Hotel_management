import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <AuthModal />
          <div className="flex-1">
            <Routes>
              {/* Public & Guest Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/rooms/:id" element={<RoomDetail />} />
              <Route path="/checkout" element={<BookingCheckout />} />
              <Route path="/my-bookings" element={<MyBookings />} />

              {/* Admin Portal Nested Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="rooms" element={<AdminRooms />} />
                <Route path="bookings" element={<AdminBookings />} />
              </Route>
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
