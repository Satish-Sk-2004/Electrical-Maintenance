const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Department = require('./Department');
const Schedule = require('./Schedule');
const WorkType = require('./WorkType');
const Group = require('./Group');

class MotorSchedule extends Model {}

MotorSchedule.init({
    motor_schedule_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    dept_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Department,
            key: 'dept_id'
        }
    },
    schedule_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Schedule,
            key: 'schedule_id'
        }
    },
    work_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: WorkType,
            key: 'work_id'
        }
    },
    frequency: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    is_deactivated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    group_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Group,
            key: 'group_id'
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    service_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Department,
            key: 'dept_id'
        }
    }
}, {
    sequelize,
    modelName: 'MotorSchedule',
    tableName: 'motor_schedules',
    timestamps: true
});

MotorSchedule.belongsTo(Department, { as: 'Department', foreignKey: 'dept_id' });
MotorSchedule.belongsTo(Schedule, { foreignKey: 'schedule_id' });
MotorSchedule.belongsTo(WorkType, { foreignKey: 'work_id' });
MotorSchedule.belongsTo(Group, { foreignKey: 'group_id' });
MotorSchedule.belongsTo(Department, { as: 'ServiceType', foreignKey: 'service_type_id' });

module.exports = MotorSchedule;