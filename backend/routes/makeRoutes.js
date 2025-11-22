const express = require('express');
const router = express.Router();
const {
    getMakes,
    addMake,
    updateMake,
    deleteMake
} = require('../controllers/makeController');

router.get('/', getMakes);
router.post('/', addMake);
router.put('/:make_id', updateMake);
router.delete('/:make_id', deleteMake);

module.exports = router;