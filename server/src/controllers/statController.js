const { supabaseAdmin } = require('../config/supabase');

// Admin: Get overall statistics
const getDashboardStats = async (req, res) => {
  try {
    // 1. Total bookings & bookings by status
    const { data: bookings, error: bErr } = await supabaseAdmin
      .from('bookings')
      .select('id, total_price, status, created_at, num_rooms');

    if (bErr) throw bErr;

    const totalBookings = bookings.length;
    const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
    const checkedInCount = bookings.filter(b => b.status === 'checked_in').length;
    const checkedOutCount = bookings.filter(b => b.status === 'checked_out').length;
    const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

    // Revenue collected (from checked_in and checked_out bookings)
    const totalRevenue = bookings
      .filter(b => ['checked_in', 'checked_out'].includes(b.status))
      .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);

    // Potential revenue from upcoming confirmed bookings
    const pendingRevenue = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);

    // 2. Total rooms & capacity
    const { data: rooms } = await supabaseAdmin
      .from('room_types')
      .select('id, total_rooms');

    const totalRoomsInventory = (rooms || []).reduce((sum, r) => sum + (r.total_rooms || 0), 0);

    // 3. Recent 5 bookings
    const { data: recentBookings } = await supabaseAdmin
      .from('bookings')
      .select('id, booking_code, guest_name, check_in, check_out, total_price, status, room_types(name)')
      .order('created_at', { ascending: false })
      .limit(5);

    return res.json({
      success: true,
      data: {
        totalBookings,
        confirmedCount,
        checkedInCount,
        checkedOutCount,
        cancelledCount,
        totalRevenue,
        pendingRevenue,
        totalRoomsInventory,
        recentBookings: recentBookings || []
      }
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats', error: err.message });
  }
};

module.exports = { getDashboardStats };
