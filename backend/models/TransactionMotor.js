const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Motor = require('./Motor');
const Machine = require('./Machine');

class TransactionMotor extends Model {}

TransactionMotor.init({
    transaction_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    motor_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
            model: Motor,
            key: 'motor_code'
        }
    },
    new_motor_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
        references: {
            model: Motor,
            key: 'motor_code'
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
    other_works: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ex_mot_rem: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    new_mot_rem: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    serviced_by: {
        type: DataTypes.ENUM('OWN SERVICE', 'MOTOR CONTRACTOR', 'RE-WINDING'),
        defaultValue: 'OWN SERVICE'
    },
    winder_cmp: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'TransactionMotor',
    tableName: 'transaction_motors',
    timestamps: true
});

TransactionMotor.belongsTo(Motor, { foreignKey: 'motor_id', targetKey: 'motor_code', as: 'Motor' });
TransactionMotor.belongsTo(Motor, { foreignKey: 'new_motor_id', targetKey: 'motor_code', as: 'NewMotor' });
TransactionMotor.belongsTo(Machine, { foreignKey: 'machine_id' });

module.exports = TransactionMotor;