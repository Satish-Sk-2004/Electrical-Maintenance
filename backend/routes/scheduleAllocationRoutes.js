const express = require('express');
const router = express.Router();
const {
    getAllocations,
    addAllocation,
    getLookupData
} = require('../controllers/scheduleAllocationController');

router.get('/', getAllocations);
router.post('/', addAllocation);
router.get('/lookup', getLookupData);

module.exports = router;