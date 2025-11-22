const MotorScheduleAllocation = require('../models/MotorScheduleAllocation');
const Motor = require('../models/Motor');
const Department = require('../models/Department');
const Machine = require('../models/Machine');
const Schedule = require('../models/Schedule');

exports.getAllocations = async (req, res) => {
    try {
        const allocations = await MotorScheduleAllocation.findAll({
            include: [
                { model: Motor, attributes: ['motor_code', 'motor_name'] },
                { model: Department, attributes: ['dept_name'] },
                { model: Machine, attributes: ['machine_number'] },
                { model: Schedule, attributes: ['schedule_name'] }
            ],
            order: [['allocation_id', 'ASC']]
        });
        return res.status(200).json({
            success: true,
            data: allocations
        });
    } catch (error) {
        console.error('Error in getAllocations:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch allocations',
            error: error.message
        });
    }
};

exports.addAllocation = async (req, res) => {
    try {
        const allocation = await MotorScheduleAllocation.create(req.body);
        const newAllocation = await MotorScheduleAllocation.findByPk(allocation.allocation_id, {
            include: [
                { model: Motor, attributes: ['motor_code', 'motor_name'] },
                { model: Department, attributes: ['dept_name'] },
                { model: Machine, attributes: ['machine_number'] },
                { model: Schedule, attributes: ['schedule_name'] }
            ]
        });
        
        return res.status(201).json({
            success: true,
            data: newAllocation
        });
    } catch (error) {
        console.error('Error in addAllocation:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create allocation',
            error: error.message
        });
    }
};

exports.toggleStatus = async (req, res) => {
    try {
        const { allocation_id } = req.params;
        const allocation = await MotorScheduleAllocation.findByPk(allocation_id);
        
        if (!allocation) {
            return res.status(404).json({
                success: false,
                message: 'Allocation not found'
            });
        }

        allocation.is_deactivated = !allocation.is_deactivated;
        await allocation.save();

        return res.status(200).json({
            success: true,
            data: allocation
        });
    } catch (error) {
        console.error('Error in toggleStatus:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to toggle status',
            error: error.message
        });
    }
};

exports.getLookupData = async (req, res) => {
    try {
        const [motors, departments, machines, schedules] = await Promise.all([
            Motor.findAll({ order: [['motor_name', 'ASC']] }),
            Department.findAll({ order: [['dept_name', 'ASC']] }),
            Machine.findAll({ order: [['machine_number', 'ASC']] }),
            Schedule.findAll({ order: [['schedule_name', 'ASC']] })
        ]);

        return res.status(200).json({
            success: true,
            data: {
                motors,
                departments,
                machines,
                schedules
            }
        });
    } catch (error) {
        console.error('Error in getLookupData:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch lookup data',
            error: error.message
        });
    }
};

exports.updateScheduleAllocation = async (req, res) => {
    try {
        const { allocation_id } = req.params;
        const { last_service_date, next_service_date, frequency } = req.body;

        const allocation = await MotorScheduleAllocation.findByPk(allocation_id);
        if (!allocation) {
            return res.status(404).json({
                success: false,
                message: 'Schedule allocation not found'
            });
        }

        await allocation.update({
            last_service_date: last_service_date || allocation.last_service_date,
            next_service_date: next_service_date || allocation.next_service_date,
            frequency: frequency || allocation.frequency
        });

        const updatedAllocation = await MotorScheduleAllocation.findByPk(allocation_id, {
            include: [
                { model: Motor },
                { model: Department },
                { model: Machine },
                { model: Schedule }
            ]
        });

        return res.status(200).json({
            success: true,
            data: updatedAllocation
        });
    } catch (error) {
        console.error('Error updating schedule allocation:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update schedule allocation',
            error: error.message
        });
    }
};