const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Make extends Model {}

Make.init({
    make_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    make_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    }
}, {
    sequelize,
    modelName: 'Make',
    tableName: 'makes',
    timestamps: true
});

module.exports = Make;