const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

// Get dashboard statistics
router.get('/stats', auth, dashboardController.getDashboardStats);

// Get upcoming maintenance
router.get('/upcoming-maintenance', auth, dashboardController.getUpcomingMaintenance);

module.exports = router;