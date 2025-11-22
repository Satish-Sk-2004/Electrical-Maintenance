const MotorSchedule = require('../models/MotorSchedule');
const Department = require('../models/Department');
const Schedule = require('../models/Schedule');
const WorkType = require('../models/WorkType');
const Group = require('../models/Group');

exports.getMotorSchedules = async (req, res) => {
    try {
        const motorSchedules = await MotorSchedule.findAll({
            include: [
                { model: Department, as: 'Department', attributes: ['dept_name'] },
                { model: Schedule, attributes: ['schedule_id', 'schedule_name'] },
                { model: WorkType, attributes: ['work_type'] },
                { model: Group, attributes: ['group_name'] },
                { model: Department, as: 'ServiceType', attributes: ['dept_name'] }
            ],
            order: [['motor_schedule_id', 'ASC']]
        });
        return res.status(200).json({
            success: true,
            data: motorSchedules
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch motor schedules',
            error: error.message
        });
    }
};

exports.addMotorSchedule = async (req, res) => {
    try {
        const motorSchedule = await MotorSchedule.create(req.body);
        return res.status(201).json({
            success: true,
            data: motorSchedule
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to add motor schedule',
            error: error.message
        });
    }
};

exports.updateMotorSchedule = async (req, res) => {
    try {
        const { motor_schedule_id } = req.params;
        const motorSchedule = await MotorSchedule.findByPk(motor_schedule_id);
        
        if (!motorSchedule) {
            return res.status(404).json({
                success: false,
                message: 'Motor schedule not found'
            });
        }

        await motorSchedule.update(req.body);
        
        const updatedMotorSchedule = await MotorSchedule.findByPk(motor_schedule_id, {
            include: [
                { model: Department, as: 'Department', attributes: ['dept_name'] },
                { model: Schedule, attributes: ['schedule_id', 'schedule_name'] },
                { model: WorkType, attributes: ['work_type'] },
                { model: Group, attributes: ['group_name'] },
                { model: Department, as: 'ServiceType', attributes: ['dept_name'] }
            ]
        });

        return res.status(200).json({
            success: true,
            data: updatedMotorSchedule
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update motor schedule',
            error: error.message
        });
    }
};

exports.deleteMotorSchedule = async (req, res) => {
    try {
        const { motor_schedule_id } = req.params;
        const motorSchedule = await MotorSchedule.findByPk(motor_schedule_id);
        
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
        return res.status(500).json({
            success: false,
            message: 'Failed to delete motor schedule',
            error: error.message
        });
    }
};

exports.getLookupData = async (req, res) => {
    try {
        const [departments, schedules, workTypes, groups] = await Promise.all([
            Department.findAll({ order: [['dept_name', 'ASC']] }),
            Schedule.findAll({ order: [['schedule_name', 'ASC']] }),
            WorkType.findAll({ order: [['work_type', 'ASC']] }),
            Group.findAll({ order: [['group_name', 'ASC']] })
        ]);

        return res.status(200).json({
            success: true,
            data: {
                departments,
                schedules,
                workTypes,
                groups
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch lookup data',
            error: error.message
        });
    }
};