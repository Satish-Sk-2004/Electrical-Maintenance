const ScheduleAllocation = require('../models/ScheduleAllocation');
const Department = require('../models/Department');
const Machine = require('../models/Machine');
const Schedule = require('../models/Schedule');
const Group = require('../models/Group');
const WorkType = require('../models/WorkType');

exports.getAllocations = async (req, res) => {
    try {
        const allocations = await ScheduleAllocation.findAll({
            include: [
                { model: Department, attributes: ['dept_name'] },
                { model: Machine, attributes: ['machine_name', 'machine_number'] },
                { model: Schedule, attributes: ['schedule_name'] },
                { model: Group, attributes: ['group_name'] },
                { model: WorkType, attributes: ['work_type'] }
            ],
            order: [['allocation_id', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            data: allocations
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch allocations',
            error: error.message
        });
    }
};

exports.getLookupData = async (req, res) => {
    try {
        const [departments, machines, schedules, groups, workTypes] = await Promise.all([
            Department.findAll({ order: [['dept_name', 'ASC']] }),
            Machine.findAll({ order: [['machine_name', 'ASC']] }),
            Schedule.findAll({ order: [['schedule_name', 'ASC']] }),
            Group.findAll({ order: [['group_name', 'ASC']] }),
            WorkType.findAll({ order: [['work_type', 'ASC']] })
        ]);

        return res.status(200).json({
            success: true,
            data: {
                departments,
                machines,
                schedules,
                groups,
                workTypes
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

exports.addAllocation = async (req, res) => {
    try {
        const allocation = await ScheduleAllocation.create(req.body);
        return res.status(201).json({
            success: true,
            data: allocation
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to create allocation',
            error: error.message
        });
    }
};