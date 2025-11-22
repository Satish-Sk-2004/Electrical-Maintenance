const Schedule = require('../models/Schedule');
const Department = require('../models/Department');
const WorkType = require('../models/WorkType');
const Group = require('../models/Group');

exports.getSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.findAll({
            include: [
                { model: Department, attributes: ['dept_name'] },
                { model: WorkType, attributes: ['work_type'] },
                { model: Group, attributes: ['group_name'] }
            ],
            order: [['schedule_id', 'ASC']]
        });
        return res.status(200).json({
            success: true,
            data: schedules
        });
    } catch (error) {
        console.error('Error in getSchedules:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch schedules',
            error: error.message
        });
    }
};

exports.addSchedule = async (req, res) => {
    try {
        const newSchedule = await Schedule.create(req.body);
        return res.status(201).json({
            success: true,
            data: newSchedule
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to add schedule',
            error: error.message
        });
    }
};

exports.getLookupData = async (req, res) => {
    try {
        const [departments, workTypes, groups] = await Promise.all([
            Department.findAll({ order: [['dept_name', 'ASC']] }),
            WorkType.findAll({ order: [['work_type', 'ASC']] }),
            Group.findAll({ order: [['group_name', 'ASC']] })
        ]);

        return res.status(200).json({
            success: true,
            data: {
                departments,
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

exports.updateSchedule = async (req, res) => {
    try {
        const { schedule_id } = req.params;
        const schedule = await Schedule.findByPk(schedule_id);
        
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        await schedule.update(req.body);

        const updatedSchedule = await Schedule.findByPk(schedule_id, {
            include: [
                { model: Department, attributes: ['dept_name'] },
                { model: WorkType, attributes: ['work_type'] },
                { model: Group, attributes: ['group_name'] }
            ]
        });

        return res.status(200).json({
            success: true,
            data: updatedSchedule
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update schedule',
            error: error.message
        });
    }
};

exports.deleteSchedule = async (req, res) => {
    try {
        const { schedule_id } = req.params;
        const schedule = await Schedule.findByPk(schedule_id);
        
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        await schedule.destroy();

        return res.status(200).json({
            success: true,
            message: 'Schedule deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to delete schedule',
            error: error.message
        });
    }
};