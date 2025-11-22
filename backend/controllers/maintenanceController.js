const { Op } = require('sequelize');
const ScheduleAllocation = require('../models/ScheduleAllocation');
const Department = require('../models/Department');
const Machine = require('../models/Machine');
const Schedule = require('../models/Schedule');
const WorkType = require('../models/WorkType');
const Group = require('../models/Group');

exports.getAllocations = async (req, res) => {
    try {
        const { startDate, endDate, dept_id, machine_id, schedule_id, work_id, group_id } = req.query;

        const whereClause = {
            next_service_date: {
                [Op.between]: [startDate, endDate]
            }
        };

        if (dept_id) whereClause.dept_id = dept_id;
        if (machine_id) whereClause.machine_id = machine_id;
        if (schedule_id) whereClause.schedule_id = schedule_id;
        if (work_id) whereClause.work_id = work_id;
        if (group_id) whereClause.group_id = group_id;

        const allocations = await ScheduleAllocation.findAll({
            where: whereClause,
            include: [
                { model: Department, attributes: ['dept_name'] },
                { model: Machine, attributes: ['machine_number'] },
                { model: Schedule, attributes: ['schedule_name'] },
                { model: WorkType, attributes: ['work_type'] },
                { model: Group, attributes: ['group_name'] }
            ],
            order: [['next_service_date', 'ASC']]
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

exports.completeService = async (req, res) => {
    try {
        const { allocation_id } = req.params;
        const { service_date } = req.body;

        const allocation = await ScheduleAllocation.findByPk(allocation_id);
        if (!allocation) {
            return res.status(404).json({
                success: false,
                message: 'Allocation not found'
            });
        }

        allocation.service_date = service_date;
        await allocation.save();

        return res.status(200).json({
            success: true,
            data: allocation
        });
    } catch (error) {
        console.error('Error in completeService:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to complete service',
            error: error.message
        });
    }
};

exports.getLookupData = async (req, res) => {
    try {
        const [departments, machines, schedules, workTypes, groups] = await Promise.all([
            Department.findAll({ order: [['dept_name', 'ASC']] }),
            Machine.findAll({ order: [['machine_number', 'ASC']] }),
            Schedule.findAll({ order: [['schedule_name', 'ASC']] }),
            WorkType.findAll({ order: [['work_type', 'ASC']] }),
            Group.findAll({ order: [['group_name', 'ASC']] })
        ]);

        return res.status(200).json({
            success: true,
            data: {
                departments,
                machines,
                schedules,
                workTypes,
                groups
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