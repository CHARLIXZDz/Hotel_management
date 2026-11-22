const { supabaseAdmin } = require('../config/supabase');

// Generate unique booking reference code e.g. HB-2611-9X72
const generateBookingCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const dateStr = new Date().toISOString().slice(2, 7).replace('-', '');
  return `HB-${dateStr}-${rand}`;
};

// Create new booking (Pay at property)
const createBooking = async (req, res) => {
  try {
    const {
      room_type_id,
      check_in,
      check_out,
      num_guests,
      num_rooms = 1,
      special_requests,
      guest_name,
      guest_email,
      guest_phone
    } = req.body;

    const userId = req.user?.id;

    if (!room_type_id || !check_in || !check_out || !guest_name || !guest_email || !guest_phone) {
      return res.status(400).json({ success: false, message: 'Please provide all required booking details.' });
    }

    const start = new Date(check_in);
    const end = new Date(check_out);
    const diffTime = end.getTime() - start.getTime();
    const totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (totalNights <= 0) {
      return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date.' });
    }

    // Fetch room type
    const { data: roomType, error: roomErr } = await supabaseAdmin
      .from('room_types')
      .select('*')
      .eq('id', room_type_id)
      .single();

    if (roomErr || !roomType) {
      return res.status(404).json({ success: false, message: 'Room type not found.' });
    }

    // Check availability
    const { data: overlappingBookings } = await supabaseAdmin
      .from('bookings')
      .select('num_rooms')
      .eq('room_type_id', room_type_id)
      .in('status', ['confirmed', 'checked_in'])
      .lt('check_in', check_out)
      .gt('check_out', check_in);

    const alreadyBooked = (overlappingBookings || []).reduce((sum, b) => sum + (b.num_rooms || 1), 0);
    const available = roomType.total_rooms - alreadyBooked;

    if (available < num_rooms) {
      return res.status(400).json({
        success: false,
        message: `Sorry, only ${Math.max(0, available)} room(s) are available for the selected dates.`
      });
    }

    const totalPrice = parseFloat(roomType.price_per_night) * totalNights * parseInt(num_rooms, 10);
    const bookingCode = generateBookingCode();

    const { data: newBooking, error: insertErr } = await supabaseAdmin
      .from('bookings')
      .insert({
        booking_code: bookingCode,
        user_id: userId,
        room_type_id,
        check_in,
        check_out,
        num_guests: parseInt(num_guests || 1, 10),
        num_rooms: parseInt(num_rooms, 10),
        total_nights: totalNights,
        total_price: totalPrice,
        payment_method: 'pay_at_property',
        status: 'confirmed',
        special_requests: special_requests || '',
        guest_name,
        guest_email,
        guest_phone
      })
      .select('*, room_types(*)')
      .single();

    if (insertErr) throw insertErr;

    return res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully. Payment due at check-in.',
      data: newBooking
    });
  } catch (err) {
    console.error('createBooking error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create booking', error: err.message });
  }
};

// Get bookings for current authenticated user
const getMyBookings = async (req, res) => {
  try {
    const userId = req.user?.id;

    const { data: bookings, error } = await supabaseAdmin
      .from('bookings')
      .select('*, room_types(*), reviews(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({ success: true, data: bookings || [] });
  } catch (err) {
    console.error('getMyBookings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch your bookings', error: err.message });
  }
};

// Admin: Get all bookings (with search and status filters)
const getAllBookings = async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = supabaseAdmin
      .from('bookings')
      .select('*, room_types(id, name, images), profiles(full_name, email)')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`booking_code.ilike.%${search}%,guest_name.ilike.%${search}%,guest_email.ilike.%${search}%,guest_phone.ilike.%${search}%`);
    }

    const { data: bookings, error } = await query;

    if (error) throw error;

    return res.json({ success: true, data: bookings || [] });
  } catch (err) {
    console.error('getAllBookings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch bookings', error: err.message });
  }
};

// Admin: Update booking status (confirmed -> checked_in -> checked_out / cancelled)
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['confirmed', 'checked_in', 'checked_out', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid booking status.' });
    }

    const { data: updated, error } = await supabaseAdmin
      .from('bookings')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*, room_types(*)')
      .single();

    if (error) throw error;

    return res.json({ success: true, message: `Booking status changed to ${status}`, data: updated });
  } catch (err) {
    console.error('updateBookingStatus error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update booking status', error: err.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus
};
