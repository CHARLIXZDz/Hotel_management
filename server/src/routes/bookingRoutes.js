const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus
} = require('../controllers/bookingController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Guest routes (requires login)
router.post('/', requireAuth, createBooking);
router.get('/my', requireAuth, getMyBookings);

// Admin-only routes
router.get('/', requireAuth, requireAdmin, getAllBookings);
router.patch('/:id/status', requireAuth, requireAdmin, updateBookingStatus);

module.exports = router;
