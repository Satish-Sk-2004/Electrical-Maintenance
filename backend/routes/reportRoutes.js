const express = require('express');
const router = express.Router();
const { generateReport } = require('../controllers/reportController');

router.get('/generate', generateReport);

module.exports = router;