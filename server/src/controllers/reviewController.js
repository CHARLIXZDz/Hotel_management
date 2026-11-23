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

    let enrichedReviews = reviews || [];
    if (enrichedReviews.length > 0) {
      try {
        const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
        const userMap = new Map();
        (authUsers?.users || []).forEach(u => {
          userMap.set(u.id, {
            avatar_url: u.user_metadata?.avatar_url || null,
            full_name: u.user_metadata?.full_name || u.email?.split('@')[0]
          });
        });

        enrichedReviews = enrichedReviews.map(r => {
          const authUser = userMap.get(r.user_id);
          return {
            ...r,
            profiles: {
              ...(r.profiles || {}),
              full_name: r.profiles?.full_name || authUser?.full_name || 'Guest',
              avatar_url: authUser?.avatar_url || null
            }
          };
        });
      } catch (authErr) {
        console.error('Failed to map user avatars:', authErr);
      }
    }

    return res.json({ success: true, data: enrichedReviews });
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

    // Check if user already reviewed this room
    const { data: existingReview } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('room_type_id', room_type_id)
      .limit(1);

    if (existingReview && existingReview.length > 0) {
      const { data: updated, error: updErr } = await supabaseAdmin
        .from('reviews')
        .update({
          rating: numRating,
          comment: comment || '',
          created_at: new Date().toISOString()
        })
        .eq('id', existingReview[0].id)
        .select('*, profiles(full_name, email)')
        .single();

      if (updErr) throw updErr;

      const userAvatar = req.user?.user_metadata?.avatar_url || null;
      const userFullName = req.user?.user_metadata?.full_name || updated.profiles?.full_name || 'Guest';

      return res.status(200).json({
        success: true,
        message: 'Review and comment updated successfully!',
        data: {
          ...updated,
          profiles: {
            ...(updated.profiles || {}),
            full_name: userFullName,
            avatar_url: userAvatar
          }
        }
      });
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

    // Attach current user's avatar & name from metadata
    const userAvatar = req.user?.user_metadata?.avatar_url || null;
    const userFullName = req.user?.user_metadata?.full_name || review.profiles?.full_name || 'Guest';

    return res.status(201).json({
      success: true,
      message: 'Review and comment submitted successfully. Thank you!',
      data: {
        ...review,
        profiles: {
          ...(review.profiles || {}),
          full_name: userFullName,
          avatar_url: userAvatar
        }
      }
    });
  } catch (err) {
    console.error('createReview error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit review', error: err.message });
  }
};

// Admin: Get all reviews across all rooms
const getAllReviews = async (req, res) => {
  try {
    const { data: reviews, error } = await supabaseAdmin
      .from('reviews')
      .select('*, room_types(id, name, slug, images, price_per_night), profiles(full_name, email), bookings(booking_code, check_in, check_out)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    let enrichedReviews = reviews || [];
    try {
      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
      const userMap = new Map();
      (authUsers?.users || []).forEach(u => {
        userMap.set(u.id, {
          avatar_url: u.user_metadata?.avatar_url || null,
          full_name: u.user_metadata?.full_name || u.email?.split('@')[0]
        });
      });

      enrichedReviews = (reviews || []).map(r => {
        const authUser = userMap.get(r.user_id);
        return {
          ...r,
          profiles: {
            ...(r.profiles || {}),
            full_name: r.profiles?.full_name || authUser?.full_name || 'Guest',
            avatar_url: authUser?.avatar_url || null
          }
        };
      });
    } catch (authErr) {
      console.error('Error fetching user avatars for all reviews:', authErr);
    }

    return res.json({ success: true, data: enrichedReviews });
  } catch (err) {
    console.error('getAllReviews error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews', error: err.message });
  }
};

// Delete review (Admin or Author)
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role || req.user?.user_metadata?.role;

    let query = supabaseAdmin.from('reviews').delete().eq('id', id);
    if (userRole !== 'admin') {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;
    if (error) throw error;

    return res.json({ success: true, message: 'Review deleted successfully.' });
  } catch (err) {
    console.error('deleteReview error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete review', error: err.message });
  }
};

module.exports = {
  getReviewsByRoom,
  createReview,
  getAllReviews,
  deleteReview
};
