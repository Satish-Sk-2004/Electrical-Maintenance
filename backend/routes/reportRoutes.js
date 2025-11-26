const express = require('express');
const router = express.Router();
const {
    getDateWiseCompletionReport,
    getMachineWiseCompletionReport,
    getScheduleWiseCompletionReport,
    getMotorWiseCompletionReport,
    getDateWisePendingReport,
    getMachineWisePendingReport,
    getScheduleWisePendingReport,
    getMotorWisePendingReport
} = require('../controllers/reportController');

// Completed Reports
router.get('/date-wise-completion', getDateWiseCompletionReport);
router.get('/machine-wise-completion', getMachineWiseCompletionReport);
router.get('/schedule-wise-completion', getScheduleWiseCompletionReport);
router.get('/motor-wise-completion', getMotorWiseCompletionReport);

// Pending Reports
router.get('/date-wise-pending', getDateWisePendingReport);
router.get('/machine-wise-pending', getMachineWisePendingReport);
router.get('/schedule-wise-pending', getScheduleWisePendingReport);
router.get('/motor-wise-pending', getMotorWisePendingReport);

module.exports = router;