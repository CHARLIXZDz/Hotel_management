const express = require('express');
const router = express.Router();
const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getRooms);
router.get('/:id', getRoomById);

// Admin-only routes
router.post('/', requireAuth, requireAdmin, createRoom);
router.put('/:id', requireAuth, requireAdmin, updateRoom);
router.delete('/:id', requireAuth, requireAdmin, deleteRoom);

module.exports = router;
