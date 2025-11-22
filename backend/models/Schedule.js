const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Department = require('./Department');
const WorkType = require('./WorkType');
const Group = require('./Group');

class Schedule extends Model {}

Schedule.init({
    schedule_id: {
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
    schedule_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    work_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: WorkType,
            key: 'work_id'
        }
    },
    frequency: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    is_deactivated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    group_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Group,
            key: 'group_id'
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Schedule',
    tableName: 'schedules',
    timestamps: true
});

// Define associations
Schedule.belongsTo(Department, { foreignKey: 'dept_id' });
Schedule.belongsTo(WorkType, { foreignKey: 'work_id' });
Schedule.belongsTo(Group, { foreignKey: 'group_id' });

module.exports = Schedule;