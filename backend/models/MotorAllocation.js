const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Department = require('./Department');
const Machine = require('./Machine');
const Motor = require('./Motor');

class MotorAllocation extends Model {}

MotorAllocation.init({
    allocation_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    dept_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Department,
            key: 'dept_id'
        }
    },
    machine_number: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    motor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Motor,
            key: 'motor_id'
        }
    },
    sl_no: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    bearing_de: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    bearing_nde: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    is_spare: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'MotorAllocation',
    tableName: 'motor_allocations',
    timestamps: true
});

MotorAllocation.belongsTo(Department, { 
    foreignKey: 'dept_id',
    onDelete: 'SET NULL'
});
MotorAllocation.belongsTo(Motor, { 
    foreignKey: 'motor_id', 
    targetKey: 'motor_id',
    onDelete: 'RESTRICT'
});

module.exports = MotorAllocation;