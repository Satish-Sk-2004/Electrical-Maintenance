const express = require('express');
const router = express.Router();
const {
    getAllocations,
    completeService,
    getLookupData
} = require('../controllers/maintenanceController');

router.get('/', getAllocations);
router.post('/:allocation_id/complete', completeService);
router.get('/lookup', getLookupData);

module.exports = router;