const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Department = require('./Department');

class Motor extends Model {}

Motor.init({
    motor_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    motor_code: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true
    },
    dept_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Department,
            key: 'dept_id'
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

module.exports = Motor;