const express = require('express');
const router = express.Router();
const { 
    getSchedules, 
    addSchedule,
    updateSchedule,
    deleteSchedule,
    getLookupData 
} = require('../controllers/scheduleController');

router.get('/', getSchedules);
router.post('/', addSchedule);
router.put('/:schedule_id', updateSchedule);
router.delete('/:schedule_id', deleteSchedule);
router.get('/lookup', getLookupData);

module.exports = router;