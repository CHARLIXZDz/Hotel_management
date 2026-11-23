const express = require('express');
const router = express.Router();
const {
  getReviewsByRoom,
  createReview,
  getAllReviews,
  deleteReview
} = require('../controllers/reviewController');
const { requireAuth } = require('../middleware/auth');

// Public: Get reviews for a specific room
router.get('/room/:roomId', getReviewsByRoom);

// Protected: Get all reviews (Admin or authenticated user)
router.get('/', requireAuth, getAllReviews);

// Protected: Post or update review
router.post('/', requireAuth, createReview);

// Protected: Delete review
router.delete('/:id', requireAuth, deleteReview);

module.exports = router;
