const { Op, sequelize } = require('sequelize');
const MotorScheduleAllocation = require('../models/MotorScheduleAllocation');
const Motor = require('../models/Motor');
const Schedule = require('../models/Schedule');
const Department = require('../models/Department');
const Machine = require('../models/Machine');
const TransactionMotor = require('../models/TransactionMotor');

// COMPLETED REPORTS
exports.getDateWiseCompletionReport = async (req, res) => {
    try {
        const { start_date, end_date, dept_id, schedule_id } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({ success: false, message: 'Start and end dates required' });
        }

        const where = {
            last_service_date: { [Op.between]: [new Date(start_date), new Date(end_date)] }
        };

        if (dept_id) where.dept_id = Number(dept_id);
        if (schedule_id) where.schedule_id = Number(schedule_id);

        const allocations = await MotorScheduleAllocation.findAll({
            where,
            include: [
                { model: Motor, attributes: ['motor_code'] },
                { model: Schedule, attributes: ['schedule_name'] },
                { model: Machine, attributes: ['machine_number'] }
            ],
            order: [['last_service_date', 'DESC']]
        });

        const reportData = allocations.map(allocation => {
            const lastServiceDate = new Date(allocation.last_service_date);
            const nextServiceDate = new Date(allocation.next_service_date);
            const delayDays = Math.floor((lastServiceDate - nextServiceDate) / (1000 * 60 * 60 * 24));

            return {
                schedule_name: allocation.Schedule?.schedule_name || '',
                frequency: allocation.frequency,
                motor_id: allocation.Motor?.motor_code || '',
                machine_number: allocation.Machine?.machine_number || '',
                last_service_date: allocation.last_service_date,
                service_date: allocation.next_service_date,
                delay: delayDays
            };
        });

        return res.status(200).json({ success: true, data: reportData });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMachineWiseCompletionReport = async (req, res) => {
    try {
        const { start_date, end_date, dept_id, schedule_id } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({ success: false, message: 'Start and end dates required' });
        }

        const where = {
            last_service_date: { [Op.between]: [new Date(start_date), new Date(end_date)] }
        };

        if (dept_id) where.dept_id = Number(dept_id);
        if (schedule_id) where.schedule_id = Number(schedule_id);

        const allocations = await MotorScheduleAllocation.findAll({
            where,
            include: [
                { model: Motor, attributes: ['motor_code'] },
                { model: Schedule, attributes: ['schedule_name'] },
                { model: Machine, attributes: ['machine_number', 'machine_name'] }
            ],
            order: [['machine_id', 'ASC'], ['last_service_date', 'DESC']]
        });

        const reportData = allocations.map(allocation => {
            const lastServiceDate = new Date(allocation.last_service_date);
            const nextServiceDate = new Date(allocation.next_service_date);
            const delayDays = Math.floor((lastServiceDate - nextServiceDate) / (1000 * 60 * 60 * 24));

            return {
                schedule_name: allocation.Schedule?.schedule_name || '',
                frequency: allocation.frequency,
                motor_id: allocation.Motor?.motor_code || '',
                machine_number: allocation.Machine?.machine_number || '',
                machine_name: allocation.Machine?.machine_name || '',
                last_service_date: allocation.last_service_date,
                service_date: allocation.next_service_date,
                delay: delayDays
            };
        });

        return res.status(200).json({ success: true, data: reportData });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getScheduleWiseCompletionReport = async (req, res) => {
    try {
        const { start_date, end_date, dept_id, schedule_id } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({ success: false, message: 'Start and end dates required' });
        }

        const where = {
            last_service_date: { [Op.between]: [new Date(start_date), new Date(end_date)] }
        };

        if (dept_id) where.dept_id = Number(dept_id);
        if (schedule_id) where.schedule_id = Number(schedule_id);

        const allocations = await MotorScheduleAllocation.findAll({
            where,
            include: [
                { model: Motor, attributes: ['motor_code'] },
                { model: Schedule, attributes: ['schedule_name'] },
                { model: Machine, attributes: ['machine_number'] }
            ],
            order: [['schedule_id', 'ASC'], ['last_service_date', 'DESC']]
        });

        const reportData = allocations.map(allocation => {
            const lastServiceDate = new Date(allocation.last_service_date);
            const nextServiceDate = new Date(allocation.next_service_date);
            const delayDays = Math.floor((lastServiceDate - nextServiceDate) / (1000 * 60 * 60 * 24));

            return {
                schedule_name: allocation.Schedule?.schedule_name || '',
                frequency: allocation.frequency,
                motor_id: allocation.Motor?.motor_code || '',
                machine_number: allocation.Machine?.machine_number || '',
                last_service_date: allocation.last_service_date,
                service_date: allocation.next_service_date,
                delay: delayDays
            };
        });

        return res.status(200).json({ success: true, data: reportData });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMotorWiseCompletionReport = async (req, res) => {
    try {
        const { start_date, end_date, dept_id, schedule_id } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({ success: false, message: 'Start and end dates required' });
        }

        const where = {
            last_service_date: { [Op.between]: [new Date(start_date), new Date(end_date)] }
        };

        if (dept_id) where.dept_id = Number(dept_id);
        if (schedule_id) where.schedule_id = Number(schedule_id);

        const allocations = await MotorScheduleAllocation.findAll({
            where,
            include: [
                { model: Motor, attributes: ['motor_code'] },
                { model: Schedule, attributes: ['schedule_name'] },
                { model: Machine, attributes: ['machine_number'] }
            ],
            order: [['motor_id', 'ASC'], ['last_service_date', 'DESC']]
        });

        const reportData = allocations.map(allocation => {
            const lastServiceDate = new Date(allocation.last_service_date);
            const nextServiceDate = new Date(allocation.next_service_date);
            const delayDays = Math.floor((lastServiceDate - nextServiceDate) / (1000 * 60 * 60 * 24));

            return {
                schedule_name: allocation.Schedule?.schedule_name || '',
                frequency: allocation.frequency,
                motor_id: allocation.Motor?.motor_code || '',
                machine_number: allocation.Machine?.machine_number || '',
                last_service_date: allocation.last_service_date,
                service_date: allocation.next_service_date,
                delay: delayDays
            };
        });

        return res.status(200).json({ success: true, data: reportData });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// PENDING REPORTS
exports.getDateWisePendingReport = async (req, res) => {
    try {
        const { end_date, dept_id, schedule_id } = req.query;

        if (!end_date) {
            return res.status(400).json({ success: false, message: 'End date required' });
        }

        const where = {};
        if (dept_id) where.dept_id = Number(dept_id);
        if (schedule_id) where.schedule_id = Number(schedule_id);

        const allocations = await MotorScheduleAllocation.findAll({
            where,
            include: [
                { model: Motor, attributes: ['motor_code'] },
                { model: Schedule, attributes: ['schedule_name'] },
                { model: Machine, attributes: ['machine_number'] }
            ]
        });

        const endDate = new Date(end_date);
        const reportData = allocations
            .map(allocation => {
                const lastServiceDate = new Date(allocation.last_service_date);
                const lastDueDate = new Date(allocation.next_service_date);
                const daysDiff = Math.floor((endDate - lastDueDate) / (1000 * 60 * 60 * 24));

                // Only pending if last due date has passed
                if (daysDiff > 0) {
                    const missedCycles = Math.floor(daysDiff / allocation.frequency);
                    const delay = daysDiff - allocation.frequency;

                    return {
                        schedule_name: allocation.Schedule?.schedule_name || '',
                        frequency: allocation.frequency,
                        motor_id: allocation.Motor?.motor_code || '',
                        machine_number: allocation.Machine?.machine_number || '',
                        last_service_date: allocation.last_service_date,
                        last_due_date: allocation.next_service_date,
                        missed_cycle: missedCycles,
                        delay: delay
                    };
                }
                return null;
            })
            .filter(item => item !== null)
            .sort((a, b) => new Date(b.last_due_date) - new Date(a.last_due_date));

        return res.status(200).json({ success: true, data: reportData });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMachineWisePendingReport = async (req, res) => {
    try {
        const { end_date, dept_id, schedule_id } = req.query;

        if (!end_date) {
            return res.status(400).json({ success: false, message: 'End date required' });
        }

        const where = {};
        if (dept_id) where.dept_id = Number(dept_id);
        if (schedule_id) where.schedule_id = Number(schedule_id);

        const allocations = await MotorScheduleAllocation.findAll({
            where,
            include: [
                { model: Motor, attributes: ['motor_code'] },
                { model: Schedule, attributes: ['schedule_name'] },
                { model: Machine, attributes: ['machine_number', 'machine_name'] }
            ],
            order: [['machine_id', 'ASC']]
        });

        const endDate = new Date(end_date);
        const reportData = allocations
            .map(allocation => {
                const lastServiceDate = new Date(allocation.last_service_date);
                const lastDueDate = new Date(allocation.next_service_date);
                const daysDiff = Math.floor((endDate - lastDueDate) / (1000 * 60 * 60 * 24));

                if (daysDiff > 0) {
                    const missedCycles = Math.floor(daysDiff / allocation.frequency);
                    const delay = daysDiff - allocation.frequency;

                    return {
                        schedule_name: allocation.Schedule?.schedule_name || '',
                        frequency: allocation.frequency,
                        motor_id: allocation.Motor?.motor_code || '',
                        machine_number: allocation.Machine?.machine_number || '',
                        machine_name: allocation.Machine?.machine_name || '',
                        last_service_date: allocation.last_service_date,
                        last_due_date: allocation.next_service_date,
                        missed_cycle: missedCycles,
                        delay: delay
                    };
                }
                return null;
            })
            .filter(item => item !== null);

        return res.status(200).json({ success: true, data: reportData });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getScheduleWisePendingReport = async (req, res) => {
    try {
        const { end_date, dept_id, schedule_id } = req.query;

        if (!end_date) {
            return res.status(400).json({ success: false, message: 'End date required' });
        }

        const where = {};
        if (dept_id) where.dept_id = Number(dept_id);
        if (schedule_id) where.schedule_id = Number(schedule_id);

        const allocations = await MotorScheduleAllocation.findAll({
            where,
            include: [
                { model: Motor, attributes: ['motor_code'] },
                { model: Schedule, attributes: ['schedule_name'] },
                { model: Machine, attributes: ['machine_number'] }
            ],
            order: [['schedule_id', 'ASC']]
        });

        const endDate = new Date(end_date);
        const reportData = allocations
            .map(allocation => {
                const lastServiceDate = new Date(allocation.last_service_date);
                const lastDueDate = new Date(allocation.next_service_date);
                const daysDiff = Math.floor((endDate - lastDueDate) / (1000 * 60 * 60 * 24));

                if (daysDiff > 0) {
                    const missedCycles = Math.floor(daysDiff / allocation.frequency);
                    const delay = daysDiff - allocation.frequency;

                    return {
                        schedule_name: allocation.Schedule?.schedule_name || '',
                        frequency: allocation.frequency,
                        motor_id: allocation.Motor?.motor_code || '',
                        machine_number: allocation.Machine?.machine_number || '',
                        last_service_date: allocation.last_service_date,
                        last_due_date: allocation.next_service_date,
                        missed_cycle: missedCycles,
                        delay: delay
                    };
                }
                return null;
            })
            .filter(item => item !== null);

        return res.status(200).json({ success: true, data: reportData });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMotorWisePendingReport = async (req, res) => {
    try {
        const { end_date, dept_id, schedule_id } = req.query;

        if (!end_date) {
            return res.status(400).json({ success: false, message: 'End date required' });
        }

        const where = {};
        if (dept_id) where.dept_id = Number(dept_id);
        if (schedule_id) where.schedule_id = Number(schedule_id);

        const allocations = await MotorScheduleAllocation.findAll({
            where,
            include: [
                { model: Motor, attributes: ['motor_code'] },
                { model: Schedule, attributes: ['schedule_name'] },
                { model: Machine, attributes: ['machine_number'] }
            ],
            order: [['motor_id', 'ASC']]
        });

        const endDate = new Date(end_date);
        const reportData = allocations
            .map(allocation => {
                const lastServiceDate = new Date(allocation.last_service_date);
                const lastDueDate = new Date(allocation.next_service_date);
                const daysDiff = Math.floor((endDate - lastDueDate) / (1000 * 60 * 60 * 24));

                if (daysDiff > 0) {
                    const missedCycles = Math.floor(daysDiff / allocation.frequency);
                    const delay = daysDiff - allocation.frequency;

                    return {
                        schedule_name: allocation.Schedule?.schedule_name || '',
                        frequency: allocation.frequency,
                        motor_id: allocation.Motor?.motor_code || '',
                        machine_number: allocation.Machine?.machine_number || '',
                        last_service_date: allocation.last_service_date,
                        last_due_date: allocation.next_service_date,
                        missed_cycle: missedCycles,
                        delay: delay
                    };
                }
                return null;
            })
            .filter(item => item !== null);

        return res.status(200).json({ success: true, data: reportData });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};