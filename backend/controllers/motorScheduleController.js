const MotorScheduleAllocation = require('../models/MotorScheduleAllocation');
const Motor = require('../models/Motor');
const Schedule = require('../models/Schedule');
const Department = require('../models/Department');
const Machine = require('../models/Machine');

exports.getAllMotorSchedules = async (req, res) => {
    try {
        const motorSchedules = await MotorScheduleAllocation.findAll({
            include: [
                { model: Motor, attributes: ['motor_code', 'motor_name'] },
                { model: Schedule, attributes: ['schedule_id', 'schedule_name'] },
                { model: Department, attributes: ['dept_id', 'dept_name'] },
                { model: Machine, attributes: ['machine_id', 'machine_number'] }
            ],
            order: [['allocation_id', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: motorSchedules
        });
    } catch (error) {
        console.error('Error fetching motor schedules:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch motor schedules',
            error: error.message
        });
    }
};

exports.createMotorSchedule = async (req, res) => {
    try {
        const { motor_id, dept_id, machine_id, schedule_id, frequency, last_service_date } = req.body;

        // Validate required fields
        if (!motor_id || !schedule_id) {
            return res.status(400).json({
                success: false,
                message: 'Motor ID and Schedule ID are required'
            });
        }

        // Validate motor exists
        const motor = await Motor.findByPk(motor_id);
        if (!motor) {
            return res.status(400).json({
                success: false,
                message: 'Motor not found'
            });
        }

        // Validate schedule exists
        const schedule = await Schedule.findByPk(schedule_id);
        if (!schedule) {
            return res.status(400).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        // Calculate due date
        const lastServiceDate = new Date(last_service_date);
        const dueDate = new Date(lastServiceDate);
        dueDate.setDate(dueDate.getDate() + (frequency || 0));

        const motorSchedule = await MotorScheduleAllocation.create({
            motor_id,
            dept_id: dept_id || null,
            machine_id: machine_id || null,
            schedule_id,
            frequency: frequency || 0,
            last_service_date: last_service_date || new Date(),
            next_service_date: dueDate
        });

        const newMotorSchedule = await MotorScheduleAllocation.findByPk(motorSchedule.allocation_id, {
            include: [
                { model: Motor, attributes: ['motor_code', 'motor_name'] },
                { model: Schedule, attributes: ['schedule_id', 'schedule_name'] },
                { model: Department, attributes: ['dept_id', 'dept_name'] },
                { model: Machine, attributes: ['machine_id', 'machine_number'] }
            ]
        });

        return res.status(201).json({
            success: true,
            data: newMotorSchedule
        });
    } catch (error) {
        console.error('Error creating motor schedule:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create motor schedule',
            error: error.message
        });
    }
};

exports.updateMotorSchedule = async (req, res) => {
    try {
        const { allocation_id } = req.params;
        const { motor_id, dept_id, machine_id, schedule_id, frequency, last_service_date, next_service_date } = req.body;

        const motorSchedule = await MotorScheduleAllocation.findByPk(allocation_id);
        if (!motorSchedule) {
            return res.status(404).json({
                success: false,
                message: 'Motor schedule not found'
            });
        }

        // Calculate new due date if last_service_date is provided
        let newDueDate = next_service_date;
        if (last_service_date && frequency) {
            const lastDate = new Date(last_service_date);
            const dueDate = new Date(lastDate);
            dueDate.setDate(dueDate.getDate() + parseInt(frequency));
            newDueDate = dueDate.toISOString().split('T')[0];
        }

        await motorSchedule.update({
            motor_id: motor_id || motorSchedule.motor_id,
            dept_id: dept_id !== undefined ? dept_id : motorSchedule.dept_id,
            machine_id: machine_id !== undefined ? machine_id : motorSchedule.machine_id,
            schedule_id: schedule_id || motorSchedule.schedule_id,
            frequency: frequency !== undefined ? frequency : motorSchedule.frequency,
            last_service_date: last_service_date || motorSchedule.last_service_date,
            next_service_date: newDueDate || motorSchedule.next_service_date
        });

        const updatedMotorSchedule = await MotorScheduleAllocation.findByPk(allocation_id, {
            include: [
                { model: Motor, attributes: ['motor_code', 'motor_name'] },
                { model: Schedule, attributes: ['schedule_id', 'schedule_name'] },
                { model: Department, attributes: ['dept_id', 'dept_name'] },
                { model: Machine, attributes: ['machine_id', 'machine_number'] }
            ]
        });

        return res.status(200).json({
            success: true,
            data: updatedMotorSchedule
        });
    } catch (error) {
        console.error('Error updating motor schedule:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update motor schedule',
            error: error.message
        });
    }
};

exports.deleteMotorSchedule = async (req, res) => {
    try {
        const { allocation_id } = req.params;

        const motorSchedule = await MotorScheduleAllocation.findByPk(allocation_id);
        if (!motorSchedule) {
            return res.status(404).json({
                success: false,
                message: 'Motor schedule not found'
            });
        }

        await motorSchedule.destroy();

        return res.status(200).json({
            success: true,
            message: 'Motor schedule deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting motor schedule:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete motor schedule',
            error: error.message
        });
    }
};

exports.getMotorSchedulesByMotor = async (req, res) => {
    try {
        const { motor_code } = req.params;

        if (!motor_code) {
            return res.status(400).json({
                success: false,
                message: 'Motor code is required'
            });
        }

        const motorSchedules = await MotorScheduleAllocation.findAll({
            where: { motor_id: motor_code },
            include: [
                { 
                    model: Motor, 
                    attributes: ['motor_code', 'motor_name']
                },
                { 
                    model: Schedule, 
                    attributes: ['schedule_id', 'schedule_name', 'description']
                },
                { 
                    model: Department, 
                    attributes: ['dept_id', 'dept_name']
                },
                { 
                    model: Machine, 
                    attributes: ['machine_id', 'machine_number']
                }
            ],
            order: [['allocation_id', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: motorSchedules
        });
    } catch (error) {
        console.error('Error fetching motor schedules by motor:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch motor schedules',
            error: error.message
        });
    }
};

exports.getMotorSchedulesByDeptAndMachine = async (req, res) => {
    try {
        const { dept_id, machine_id } = req.query;

        if (!dept_id || !machine_id) {
            return res.status(400).json({
                success: false,
                message: 'Department ID and Machine ID are required'
            });
        }

        const motorSchedules = await MotorScheduleAllocation.findAll({
            where: { 
                dept_id: Number(dept_id),
                machine_id: Number(machine_id)
            },
            include: [
                { model: Motor, attributes: ['motor_code', 'motor_name'] },
                { model: Schedule, attributes: ['schedule_id', 'schedule_name'] },
                { model: Department, attributes: ['dept_id', 'dept_name'] },
                { model: Machine, attributes: ['machine_id', 'machine_number'] }
            ],
            order: [['allocation_id', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: motorSchedules
        });
    } catch (error) {
        console.error('Error fetching motor schedules:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch motor schedules',
            error: error.message
        });
    }
};


exports.getMotorSchedulesLookup = async (req, res) => {
    try {
        const motorSchedules = await MotorScheduleAllocation.findAll({
            attributes: ['allocation_id', 'motor_id', 'schedule_id', 'frequency', 'last_service_date', 'next_service_date'],
            include: [
                { 
                    model: Motor, 
                    attributes: ['motor_code', 'motor_name']
                },
                { 
                    model: Schedule, 
                    attributes: ['schedule_id', 'schedule_name', 'description']
                },
                { 
                    model: Department, 
                    attributes: ['dept_id', 'dept_name']
                },
                { 
                    model: Machine, 
                    attributes: ['machine_id', 'machine_number']
                }
            ],
            order: [['allocation_id', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: motorSchedules
        });
    } catch (error) {
        console.error('Error fetching motor schedules lookup:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch motor schedules',
            error: error.message
        });
    }
};