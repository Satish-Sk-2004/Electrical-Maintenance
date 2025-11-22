const express = require('express');
const router = express.Router();
const {
    getAllocations,
    addAllocation,
    toggleStatus,
    getLookupData
} = require('../controllers/motorScheduleAllocationController');

router.get('/', getAllocations);
router.post('/', addAllocation);
router.patch('/:allocation_id/toggle-status', toggleStatus);
router.get('/lookup', getLookupData);

module.exports = router;