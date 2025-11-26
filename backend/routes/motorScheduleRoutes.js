const express = require('express');
const router = express.Router();
const {
    getAllMotorSchedules,
    createMotorSchedule,
    updateMotorSchedule,
    deleteMotorSchedule,
    getMotorSchedulesByMotor,
    getMotorSchedulesByDeptAndMachine,
    getMotorSchedulesLookup
} = require('../controllers/motorScheduleController');

// GET endpoints first (before parameterized routes)
router.get('/lookup', getMotorSchedulesLookup);
router.get('/by-motor/:motor_code', getMotorSchedulesByMotor);
router.get('/by-dept-machine', getMotorSchedulesByDeptAndMachine);

// Other endpoints
router.get('/', getAllMotorSchedules);
router.post('/', createMotorSchedule);
router.put('/:allocation_id', updateMotorSchedule);
router.delete('/:allocation_id', deleteMotorSchedule);

module.exports = router;