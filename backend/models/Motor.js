const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Department = require('./Department');
const Machine = require('./Machine');

class Motor extends Model {}

Motor.init({
    motor_code: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false
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
        allowNull: true,
        references: {
            model: Machine,
            key: 'machine_id'
        }
    },
    make_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    motor_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    capacity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    kw: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    rpm: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    frame_size: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    voltage: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    current: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    motor_description: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'Motor',
    tableName: 'motors',
    timestamps: true
});

Motor.belongsTo(Department, { foreignKey: 'dept_id' });
Motor.belongsTo(Machine, { foreignKey: 'machine_id' });

module.exports = Motor;