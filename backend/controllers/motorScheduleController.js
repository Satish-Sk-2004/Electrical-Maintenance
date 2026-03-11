const MotorSchedule = require('../models/MotorSchedule');
const Department = require('../models/Department');
const WorkType = require('../models/WorkType');
const Group = require('../models/Group');
const Machine = require('../models/Machine');


exports.getAllMotorSchedules = async (req, res) => {
    try {
        const motorSchedules = await MotorSchedule.findAll({
            include: [
                { model: Department, as: 'Department', attributes: ['dept_id', 'dept_name'] },
                { model: WorkType, attributes: ['work_id', 'work_type'] },
                { model: Group, attributes: ['group_id', 'group_name'] }
            ],
            order: [['motor_schedule_id', 'DESC']]
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
        const { dept_id, schedule_name, work_id, frequency, group_id, description, service_type, is_deactivated } = req.body;

        // Validate required fields
        if (!dept_id || !schedule_name || !work_id || !group_id) {
            return res.status(400).json({
                success: false,
                message: 'Department, Schedule Name, WorkType, and Group are required'
            });
        }

        // Validate department exists
        const department = await Department.findByPk(dept_id);
        if (!department) {
            return res.status(400).json({
                success: false,
                message: 'Department not found'
            });
        }

        // Validate worktype exists
        const workType = await WorkType.findByPk(work_id);
        if (!workType) {
            return res.status(400).json({
                success: false,
                message: 'WorkType not found'
            });
        }

        // Validate group exists
        const group = await Group.findByPk(group_id);
        if (!group) {
            return res.status(400).json({
                success: false,
                message: 'Group not found'
            });
        }


        const motorSchedule = await MotorSchedule.create({
            dept_id,
            schedule_name,
            work_id,
            frequency: frequency || 0,
            group_id,
            description: description || null,
            service_type: service_type || 'Bearing',
            is_deactivated: is_deactivated || false
        });

        const newMotorSchedule = await MotorSchedule.findByPk(motorSchedule.motor_schedule_id, {
            include: [
                { model: Department, as: 'Department', attributes: ['dept_id', 'dept_name'] },
                { model: WorkType, attributes: ['work_id', 'work_type'] },
                { model: Group, attributes: ['group_id', 'group_name'] }
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
        const { motor_schedule_id } = req.params;
        const { dept_id, schedule_name, work_id, frequency, group_id, description, service_type, is_deactivated } = req.body;

        const motorSchedule = await MotorSchedule.findByPk(motor_schedule_id);
        if (!motorSchedule) {
            return res.status(404).json({
                success: false,
                message: 'Motor schedule not found'
            });
        }

        await motorSchedule.update({
            dept_id: dept_id || motorSchedule.dept_id,
            schedule_name: schedule_name || motorSchedule.schedule_name,
            work_id: work_id || motorSchedule.work_id,
            frequency: frequency !== undefined ? frequency : motorSchedule.frequency,
            group_id: group_id || motorSchedule.group_id,
            description: description !== undefined ? description : motorSchedule.description,
            service_type: service_type || motorSchedule.service_type,
            is_deactivated: is_deactivated !== undefined ? is_deactivated : motorSchedule.is_deactivated
        });

        const updatedMotorSchedule = await MotorSchedule.findByPk(motor_schedule_id, {
            include: [
                { model: Department, as: 'Department', attributes: ['dept_id', 'dept_name'] },
                { model: WorkType, attributes: ['work_id', 'work_type'] },
                { model: Group, attributes: ['group_id', 'group_name'] }
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
        console.error('Error deleting motor schedule:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete motor schedule',
            error: error.message
        });
    }
};

exports.getMotorSchedulesLookup = async (req, res) => {
    try {
        const motorSchedules = await MotorSchedule.findAll({
            include: [
                { model: Department, as: 'Department', attributes: ['dept_id', 'dept_name'] },
                { model: WorkType, attributes: ['work_id', 'work_type'] },
                { model: Group, attributes: ['group_id', 'group_name'] }
            ],
            order: [['motor_schedule_id', 'DESC']]
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

exports.getMotorSchedulesByMotor = async (req, res) => {
    try {
        const { motor_id } = req.params;
        const MotorScheduleAllocation = require('../models/MotorScheduleAllocation');
        const Schedule = require('../models/Schedule');

        const schedules = await MotorScheduleAllocation.findAll({
            where: { motor_id },
            include: [
                { model: Schedule, attributes: ['schedule_id', 'schedule_name', 'frequency'] },
                { model: Department, attributes: ['dept_id', 'dept_name'] },
                { model: Machine, attributes: ['machine_id', 'machine_number'] }
            ],
            order: [['allocation_id', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: schedules
        });
    } catch (error) {
        console.error('Error fetching schedules by motor:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch schedules',
            error: error.message
        });
    }
};