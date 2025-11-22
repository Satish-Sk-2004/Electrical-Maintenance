const express = require('express');
const router = express.Router();
const {
    getGroups,
    addGroup,
    updateGroup,
    deleteGroup
} = require('../controllers/groupController');

router.get('/', getGroups);
router.post('/', addGroup);
router.put('/:group_id', updateGroup);
router.delete('/:group_id', deleteGroup);

module.exports = router;