const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machineController');

// Machine routes
router.get('/', machineController.getMachines);
router.post('/', machineController.addMachine);
router.put('/:machine_id', machineController.updateMachine);
router.delete('/:machine_id', machineController.deleteMachine);
router.get('/departments', machineController.getDepartments);

module.exports = router;