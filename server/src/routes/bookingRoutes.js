const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  getRecentBookingsForSocialProof
} = require('../controllers/bookingController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Public route for live recent bookings social proof
router.get('/recent-social', getRecentBookingsForSocialProof);

// Guest routes (requires login)
router.post('/', requireAuth, createBooking);
router.get('/my', requireAuth, getMyBookings);

// Admin-only routes
router.get('/', requireAuth, requireAdmin, getAllBookings);
router.patch('/:id/status', requireAuth, requireAdmin, updateBookingStatus);

module.exports = router;
