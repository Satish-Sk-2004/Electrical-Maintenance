const express = require('express');
const router = express.Router();
const {
    getAllMotorSchedules,
    createMotorSchedule,
    updateMotorSchedule,
    deleteMotorSchedule,
    getMotorSchedulesLookup,
    getMotorSchedulesByMotor
} = require('../controllers/motorScheduleController');

router.get('/lookup', getMotorSchedulesLookup);
router.get('/by-motor/:motor_id', getMotorSchedulesByMotor);  // Add this line
router.get('/', getAllMotorSchedules);
router.post('/', createMotorSchedule);
router.put('/:motor_schedule_id', updateMotorSchedule);
router.delete('/:motor_schedule_id', deleteMotorSchedule);

module.exports = router;