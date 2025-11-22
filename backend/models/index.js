const { Sequelize } = require('sequelize');
const config = require('../config/database');

// Create a new Sequelize instance
const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: console.log, // Set to 'false' to disable logging SQL queries
});

const db = {};

// Import each model function and call it with `sequelize`
// This initializes the model and attaches it to the sequelize instance
db.Department = require('./Department')(sequelize, Sequelize.DataTypes);

// Set up the associations between models
// This is where we define relationships like hasMany/belongsTo
db.Department.belongsTo(db.Company);

// Attach the sequelize instance and Sequelize library to the db object
db.sequelize = sequelize;

module.exports = db;