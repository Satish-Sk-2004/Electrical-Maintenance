const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Group extends Model {}

Group.init({
    group_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    group_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    }
}, {
    sequelize,
    modelName: 'Group',
    tableName: 'groups',
    timestamps: true
});

module.exports = Group;