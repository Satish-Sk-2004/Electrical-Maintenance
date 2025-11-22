const express = require('express');
const router = express.Router();
const {
    getMotors,
    addMotor,
    updateMotor,
    deleteMotor,
    getMotorsByDepartment
} = require('../controllers/motorController');

router.get('/', getMotors);
router.post('/', addMotor);
router.put('/:motor_code', updateMotor);
router.delete('/:motor_code', deleteMotor);
router.get('/by-department', getMotorsByDepartment);

module.exports = router;