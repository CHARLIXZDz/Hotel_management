const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/statController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/dashboard', requireAuth, requireAdmin, getDashboardStats);

module.exports = router;
