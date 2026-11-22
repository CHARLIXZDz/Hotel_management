const express = require('express');
const router = express.Router();
const { getReviewsByRoom, createReview } = require('../controllers/reviewController');
const { requireAuth } = require('../middleware/auth');

// Public
router.get('/room/:roomId', getReviewsByRoom);

// Protected (Guest who checked out)
router.post('/', requireAuth, createReview);

module.exports = router;
