const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Motor = require('./Motor');
const Department = require('./Department');
const Machine = require('./Machine');
const Schedule = require('./Schedule');

class MotorScheduleAllocation extends Model {}

MotorScheduleAllocation.init({
    allocation_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    motor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Motor,
            key: 'motor_code'
        }
    },
    dept_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Department,
            key: 'dept_id'
        }
    },
    machine_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Machine,
            key: 'machine_id'
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
    frequency: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    last_service_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    next_service_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    is_deactivated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'MotorScheduleAllocation',
    tableName: 'motor_schedule_allocations',
    timestamps: true
});

MotorScheduleAllocation.belongsTo(Motor, { foreignKey: 'motor_id' });
MotorScheduleAllocation.belongsTo(Department, { foreignKey: 'dept_id' });
MotorScheduleAllocation.belongsTo(Machine, { foreignKey: 'machine_id' });
MotorScheduleAllocation.belongsTo(Schedule, { foreignKey: 'schedule_id' });

module.exports = MotorScheduleAllocation;