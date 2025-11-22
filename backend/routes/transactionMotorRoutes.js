const express = require('express');
const router = express.Router();
const {
    getAllTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionByMotor
} = require('../controllers/transactionMotorController');

router.get('/', getAllTransactions);
router.post('/', createTransaction);
router.get('/by-motor', getTransactionByMotor);
router.put('/:transaction_id', updateTransaction);
router.delete('/:transaction_id', deleteTransaction);

module.exports = router;