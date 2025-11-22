const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class WorkType extends Model {}

WorkType.init({
    work_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    work_type: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    }
}, {
    sequelize,
    modelName: 'WorkType',
    tableName: 'work_types',
    timestamps: true
});

module.exports = WorkType;