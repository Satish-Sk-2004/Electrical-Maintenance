const express = require('express');
const router = express.Router();
const {
    getMotorSchedules,
    addMotorSchedule,
    updateMotorSchedule,
    deleteMotorSchedule,
    getLookupData
} = require('../controllers/motorScheduleController');

router.get('/', getMotorSchedules);
router.post('/', addMotorSchedule);
router.put('/:motor_schedule_id', updateMotorSchedule);
router.delete('/:motor_schedule_id', deleteMotorSchedule);
router.get('/lookup', getLookupData);

module.exports = router;