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
    machine_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Machine,
            key: 'machine_id'
        }
    },
    motor_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
            model: Motor,
            key: 'motor_code'
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
MotorAllocation.belongsTo(Machine, { 
    foreignKey: 'machine_id',
    onDelete: 'SET NULL'
});
MotorAllocation.belongsTo(Motor, { 
    foreignKey: 'motor_id', 
    targetKey: 'motor_code',
    onDelete: 'RESTRICT'
});

module.exports = MotorAllocation;