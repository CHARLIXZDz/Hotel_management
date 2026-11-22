const { supabaseAdmin } = require('../config/supabase');

// Get reviews / comments for a room
const getReviewsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const { data: reviews, error } = await supabaseAdmin
      .from('reviews')
      .select('*, profiles(full_name, email)')
      .eq('room_type_id', roomId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({ success: true, data: reviews || [] });
  } catch (err) {
    console.error('getReviewsByRoom error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews', error: err.message });
  }
};

// Create a review / comment (Authenticated guests or admins)
const createReview = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { room_type_id, rating, comment } = req.body;
    let booking_id = req.body.booking_id;

    if (!room_type_id || !rating) {
      return res.status(400).json({ success: false, message: 'Room type ID and rating are required.' });
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
    }

    // Try linking to user's real booking if available
    if (!booking_id) {
      const { data: userBooking } = await supabaseAdmin
        .from('bookings')
        .select('id')
        .eq('user_id', userId)
        .eq('room_type_id', room_type_id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (userBooking && userBooking.length > 0) {
        // Check if this booking was already used for a review
        const { data: alreadyUsed } = await supabaseAdmin
          .from('reviews')
          .select('id')
          .eq('booking_id', userBooking[0].id)
          .single();

        if (!alreadyUsed) {
          booking_id = userBooking[0].id;
        }
      }
    }

    const { data: review, error: revErr } = await supabaseAdmin
      .from('reviews')
      .insert({
        booking_id: booking_id || null,
        room_type_id,
        user_id: userId,
        rating: numRating,
        comment: comment || ''
      })
      .select('*, profiles(full_name, email)')
      .single();

    if (revErr) throw revErr;

    return res.status(201).json({
      success: true,
      message: 'Review and comment submitted successfully. Thank you!',
      data: review
    });
  } catch (err) {
    console.error('createReview error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit review', error: err.message });
  }
};

module.exports = {
  getReviewsByRoom,
  createReview
};
