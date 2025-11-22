const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Department = require('./Department');
const Machine = require('./Machine');
const Schedule = require('./Schedule');
const Group = require('./Group');
const WorkType = require('./WorkType');

class ScheduleAllocation extends Model {}

ScheduleAllocation.init({
    allocation_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    dept_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Department,
            key: 'dept_id'
        }
    },
    machine_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Machine,
            key: 'machine_id'
        }
    },
    schedule_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Schedule,
            key: 'schedule_id'
        }
    },
    group_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Group,
            key: 'group_id'
        }
    },
    work_id: {
        type: DataTypes.INTEGER,
        references: {
            model: WorkType,
            key: 'work_id'
        }
    },
    last_service_date: {
        type: DataTypes.DATE
    },
    next_service_date: {
        type: DataTypes.DATE
    },
    is_deactivated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'ScheduleAllocation',
    tableName: 'schedule_allocations',
    timestamps: true
});

// Define associations
ScheduleAllocation.belongsTo(Department, { foreignKey: 'dept_id' });
ScheduleAllocation.belongsTo(Machine, { foreignKey: 'machine_id' });
ScheduleAllocation.belongsTo(Schedule, { foreignKey: 'schedule_id' });
ScheduleAllocation.belongsTo(Group, { foreignKey: 'group_id' });
ScheduleAllocation.belongsTo(WorkType, { foreignKey: 'work_id' });

module.exports = ScheduleAllocation;