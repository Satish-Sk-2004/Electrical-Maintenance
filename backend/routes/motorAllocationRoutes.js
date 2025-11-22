const express = require('express');
const router = express.Router();
const {
    getAllAllocations,
    createAllocation,
    updateAllocation,
    deleteAllocation,
    getMotorsByMachine,
    getSpareMotors
} = require('../controllers/motorAllocationController');

router.get('/', getAllAllocations);
router.post('/', createAllocation);
router.put('/:allocation_id', updateAllocation);
router.delete('/:allocation_id', deleteAllocation);
router.get('/by-machine', getMotorsByMachine);
router.get('/spare', getSpareMotors);

module.exports = router;