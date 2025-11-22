const { Op } = require('sequelize');
const ScheduleAllocation = require('../models/ScheduleAllocation');
const Department = require('../models/Department');
const Machine = require('../models/Machine');
const Schedule = require('../models/Schedule');
const Motor = require('../models/Motor');
const TransactionMotor = require('../models/TransactionMotor');

exports.generateReport = async (req, res) => {
    try {
        const { type, fromDate, toDate, reportOption, selectAll } = req.query;

        let data = [];
        const dateRange = {
            [Op.between]: [fromDate, toDate]
        };

        switch (type) {
            case 'schedule':
                switch (reportOption) {
                    case 'date-completed':
                        data = await ScheduleAllocation.findAll({
                            where: {
                                service_date: dateRange
                            },
                            include: [
                                { model: Department, attributes: ['dept_name'] },
                                { model: Machine, attributes: ['machine_number'] },
                                { model: Schedule, attributes: ['schedule_name'] }
                            ],
                            order: [['service_date', 'ASC']]
                        });
                        break;
                    // Add more cases for other report options
                }
                break;

            case 'motor':
                // Implement motor reports
                break;

            case 'motor_new':
                // Implement new motor reports
                break;
        }

        return res.status(200).json({
            success: true,
            data: data.map(item => ({
                date: item.service_date,
                department: item.Department.dept_name,
                machine: item.Machine.machine_number,
                schedule: item.Schedule.schedule_name,
                status: 'Completed'
            }))
        });
    } catch (error) {
        console.error('Error generating report:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to generate report',
            error: error.message
        });
    }
};