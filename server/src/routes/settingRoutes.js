const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Public route to fetch contact & general site settings
router.get('/contact', settingController.getContactSettings);

// Admin-only route to update contact settings
router.put('/contact', requireAuth, requireAdmin, settingController.updateContactSettings);

module.exports = router;
