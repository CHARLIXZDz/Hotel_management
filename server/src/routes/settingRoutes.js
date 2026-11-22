const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Contact settings
router.get('/contact', settingController.getContactSettings);
router.put('/contact', requireAuth, requireAdmin, settingController.updateContactSettings);

// Hero banner images settings
router.get('/banners', settingController.getHeroBanners);
router.put('/banners', requireAuth, requireAdmin, settingController.updateHeroBanners);

module.exports = router;
