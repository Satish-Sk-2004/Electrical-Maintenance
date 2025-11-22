const express = require('express');
const router = express.Router();
const { 
    getWorkTypes, 
    addWorkType,
    updateWorkType,
    deleteWorkType 
} = require('../controllers/workTypeController');

router.get('/', getWorkTypes);
router.post('/', addWorkType);
router.put('/:work_id', updateWorkType);
router.delete('/:work_id', deleteWorkType);

module.exports = router;