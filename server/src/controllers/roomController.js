const { supabaseAdmin } = require('../config/supabase');

// Get all rooms (with optional checkIn/checkOut date filtering to calculate remaining rooms)
const getRooms = async (req, res) => {
  try {
    const { checkIn, checkOut, capacity } = req.query;

    let query = supabaseAdmin
      .from('room_types')
      .select('*, reviews(rating)')
      .eq('is_active', true)
      .order('price_per_night', { ascending: true });

    if (capacity) {
      query = query.gte('capacity', parseInt(capacity, 10));
    }

    const { data: rooms, error } = await query;

    if (error) throw error;

    // If checkIn and checkOut provided, calculate available rooms for each room_type
    let formattedRooms = rooms.map(room => {
      const ratings = room.reviews?.map(r => r.rating) || [];
      const avgRating = ratings.length > 0 
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) 
        : null;
      return {
        ...room,
        avg_rating: avgRating ? parseFloat(avgRating) : null,
        review_count: ratings.length,
        available_rooms: room.total_rooms
      };
    });

    if (checkIn && checkOut) {
      // Find all overlapping bookings
      const { data: overlappingBookings, error: bookingErr } = await supabaseAdmin
        .from('bookings')
        .select('room_type_id, num_rooms')
        .in('status', ['confirmed', 'checked_in'])
        .lt('check_in', checkOut)
        .gt('check_out', checkIn);

      if (!bookingErr && overlappingBookings) {
        const bookedCounts = {};
        overlappingBookings.forEach(b => {
          bookedCounts[b.room_type_id] = (bookedCounts[b.room_type_id] || 0) + (b.num_rooms || 1);
        });

        formattedRooms = formattedRooms.map(room => ({
          ...room,
          available_rooms: Math.max(0, room.total_rooms - (bookedCounts[room.id] || 0))
        }));
      }
    }

    return res.json({ success: true, data: formattedRooms });
  } catch (err) {
    console.error('getRooms error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch rooms', error: err.message });
  }
};

// Get single room by ID or slug
const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let query = supabaseAdmin
      .from('room_types')
      .select('*, reviews(*, profiles(full_name))');

    if (isUuid) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }

    const { data: room, error } = await query.single();

    if (error || !room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    let enrichedReviews = room.reviews || [];
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

    const ratings = enrichedReviews?.map(r => r.rating) || [];
    const avgRating = ratings.length > 0 
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) 
      : null;

    return res.json({
      success: true,
      data: {
        ...room,
        reviews: enrichedReviews,
        avg_rating: avgRating ? parseFloat(avgRating) : null,
        review_count: ratings.length
      }
    });
  } catch (err) {
    console.error('getRoomById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch room details', error: err.message });
  }
};

// Admin: Create new room type
const createRoom = async (req, res) => {
  try {
    const {
      name,
      description,
      price_per_night,
      capacity,
      bed_type,
      size_sqm,
      total_rooms,
      amenities,
      images
    } = req.body;

    if (!name || !price_per_night) {
      return res.status(400).json({ success: false, message: 'Room name and price are required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    const { data: newRoom, error } = await supabaseAdmin
      .from('room_types')
      .insert({
        name,
        slug,
        description,
        price_per_night: parseFloat(price_per_night),
        capacity: parseInt(capacity || 2, 10),
        bed_type: bed_type || 'King Bed',
        size_sqm: parseInt(size_sqm || 30, 10),
        total_rooms: parseInt(total_rooms || 1, 10),
        amenities: amenities || [],
        images: images || [],
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, message: 'Room created successfully', data: newRoom });
  } catch (err) {
    console.error('createRoom error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create room', error: err.message });
  }
};

// Admin: Update room type
const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: updatedRoom, error } = await supabaseAdmin
      .from('room_types')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.json({ success: true, message: 'Room updated successfully', data: updatedRoom });
  } catch (err) {
    console.error('updateRoom error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update room', error: err.message });
  }
};

// Admin: Delete room type
const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if there are active bookings
    const { data: activeBookings } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('room_type_id', id)
      .in('status', ['confirmed', 'checked_in']);

    if (activeBookings && activeBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete room with active or future confirmed bookings. You can deactivate it instead.'
      });
    }

    const { error } = await supabaseAdmin
      .from('room_types')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.json({ success: true, message: 'Room deleted successfully' });
  } catch (err) {
    console.error('deleteRoom error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete room', error: err.message });
  }
};

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
};
