const { supabaseAdmin } = require('../config/supabase');

// Get reviews for a room
const getReviewsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const { data: reviews, error } = await supabaseAdmin
      .from('reviews')
      .select('*, profiles(full_name)')
      .eq('room_type_id', roomId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({ success: true, data: reviews || [] });
  } catch (err) {
    console.error('getReviewsByRoom error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews', error: err.message });
  }
};

// Create a review (Only for guests whose booking is checked_out)
const createReview = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { booking_id, room_type_id, rating, comment } = req.body;

    if (!booking_id || !room_type_id || !rating) {
      return res.status(400).json({ success: false, message: 'Booking ID, room type and rating are required.' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    // Check that booking exists, belongs to user, and is checked_out
    const { data: booking, error: bErr } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .eq('user_id', userId)
      .single();

    if (bErr || !booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or not owned by you.' });
    }

    if (booking.status !== 'checked_out') {
      return res.status(400).json({ success: false, message: 'You can only review after checking out of the hotel.' });
    }

    // Check if already reviewed
    const { data: existing } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('booking_id', booking_id)
      .single();

    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this booking.' });
    }

    const { data: review, error: revErr } = await supabaseAdmin
      .from('reviews')
      .insert({
        booking_id,
        room_type_id,
        user_id: userId,
        rating: parseInt(rating, 10),
        comment: comment || ''
      })
      .select('*, profiles(full_name)')
      .single();

    if (revErr) throw revErr;

    return res.status(201).json({ success: true, message: 'Review submitted successfully. Thank you!', data: review });
  } catch (err) {
    console.error('createReview error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit review', error: err.message });
  }
};

module.exports = {
  getReviewsByRoom,
  createReview
};
