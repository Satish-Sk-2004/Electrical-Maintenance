const TransactionMotor = require('../models/TransactionMotor');
const Motor = require('../models/Motor');
const Machine = require('../models/Machine');
const MotorScheduleAllocation = require('../models/MotorScheduleAllocation');

exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await TransactionMotor.findAll({
            include: [
                { model: Motor, as: 'Motor', attributes: ['motor_code', 'motor_name'] },
                { model: Motor, as: 'NewMotor', attributes: ['motor_code', 'motor_name'] },
                { model: Machine, attributes: ['machine_number'] }
            ],
            order: [['transaction_id', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch transactions',
            error: error.message
        });
    }
};

exports.createTransaction = async (req, res) => {
    try {
        const { date, motor_id, new_motor_id, machine_id, other_works, ex_mot_rem, new_mot_rem, serviced_by, winder_cmp } = req.body;

        // Validate motor exists
        const motor = await Motor.findByPk(motor_id);
        if (!motor) {
            return res.status(400).json({
                success: false,
                message: 'Motor not found'
            });
        }

        const transaction = await TransactionMotor.create({
            date: new Date(date),
            motor_id,
            new_motor_id: new_motor_id || null,
            machine_id: machine_id || null,
            other_works: other_works || null,
            ex_mot_rem: ex_mot_rem || null,
            new_mot_rem: new_mot_rem || null,
            serviced_by: serviced_by || 'OWN SERVICE',
            winder_cmp: winder_cmp || null
        });

        const newTransaction = await TransactionMotor.findByPk(transaction.transaction_id, {
            include: [
                { model: Motor, as: 'Motor', attributes: ['motor_code', 'motor_name'] },
                { model: Motor, as: 'NewMotor', attributes: ['motor_code', 'motor_name'] },
                { model: Machine, attributes: ['machine_number'] }
            ]
        });

        return res.status(201).json({
            success: true,
            data: newTransaction
        });
    } catch (error) {
        console.error('Error creating transaction:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create transaction',
            error: error.message
        });
    }
};

exports.getTransactionByMotor = async (req, res) => {
    try {
        const { motor_id, dept_id, machine_id } = req.query;

        if (!motor_id) {
            return res.status(400).json({
                success: false,
                message: 'Motor ID is required'
            });
        }

        const transaction = await TransactionMotor.findOne({
            where: { motor_id },
            include: [
                { model: Motor, as: 'Motor', attributes: ['motor_code', 'motor_name'] },
                { model: Machine, attributes: ['machine_number'] }
            ]
        });

        return res.status(200).json({
            success: true,
            data: transaction || null
        });
    } catch (error) {
        console.error('Error fetching transaction:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch transaction',
            error: error.message
        });
    }
};

exports.updateTransaction = async (req, res) => {
    try {
        const { transaction_id } = req.params;
        const { date, motor_id, new_motor_id, machine_id, other_works, ex_mot_rem, new_mot_rem, serviced_by, winder_cmp } = req.body;

        const transaction = await TransactionMotor.findByPk(transaction_id);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        await transaction.update({
            date: date ? new Date(date) : transaction.date,
            motor_id: motor_id || transaction.motor_id,
            new_motor_id: new_motor_id || transaction.new_motor_id,
            machine_id: machine_id || transaction.machine_id,
            other_works: other_works || transaction.other_works,
            ex_mot_rem: ex_mot_rem || transaction.ex_mot_rem,
            new_mot_rem: new_mot_rem || transaction.new_mot_rem,
            serviced_by: serviced_by || transaction.serviced_by,
            winder_cmp: winder_cmp || transaction.winder_cmp
        });

        const updatedTransaction = await TransactionMotor.findByPk(transaction_id, {
            include: [
                { model: Motor, as: 'Motor', attributes: ['motor_code', 'motor_name'] },
                { model: Motor, as: 'NewMotor', attributes: ['motor_code', 'motor_name'] },
                { model: Machine, attributes: ['machine_number'] }
            ]
        });

        return res.status(200).json({
            success: true,
            data: updatedTransaction
        });
    } catch (error) {
        console.error('Error updating transaction:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update transaction',
            error: error.message
        });
    }
};

exports.deleteTransaction = async (req, res) => {
    try {
        const { transaction_id } = req.params;

        const transaction = await TransactionMotor.findByPk(transaction_id);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        await transaction.destroy();

        return res.status(200).json({
            success: true,
            message: 'Transaction deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete transaction',
            error: error.message
        });
    }
};