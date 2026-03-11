const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Department = require('./Department');
const Make = require('./Make');

class Machine extends Model {}

Machine.init({
    machine_id: {
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
    mill_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    machine_number: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    machine_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    make_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    year_of_manufacture: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    commissioning_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    manufacturer_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    version: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Machine',
    tableName: 'machines',
    timestamps: true
});

// Define associations
Machine.belongsTo(Department, { foreignKey: 'dept_id' });

module.exports = Machine;