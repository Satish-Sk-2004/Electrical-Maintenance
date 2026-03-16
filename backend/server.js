const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const departmentRoutes = require('./routes/departmentRoutes');
const groupRoutes = require('./routes/groupRoutes');
const makeRoutes = require('./routes/makeRoutes');
const machineRoutes = require('./routes/machineRoutes');
const workTypeRoutes = require('./routes/workTypeRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const scheduleAllocationRoutes = require('./routes/scheduleAllocationRoutes');
const motorRoutes = require('./routes/motorRoutes');
const motorScheduleRoutes = require('./routes/motorScheduleRoutes');
const motorAllocationRoutes = require('./routes/motorAllocationRoutes');
const motorScheduleAllocationRoutes = require('./routes/motorScheduleAllocationRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const transactionMotorRoutes = require('./routes/transactionMotorRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', // Vite's default port
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/departments', departmentRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/makes', makeRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/worktypes', workTypeRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/schedule-allocations', scheduleAllocationRoutes);
app.use('/api/motors', motorRoutes);
app.use('/api/motor-schedules', motorScheduleRoutes);
app.use('/api/motor-allocations', motorAllocationRoutes);
app.use('/api/motor-schedule-allocations', motorScheduleAllocationRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/transaction-motors', transactionMotorRoutes);
app.use('/api/reports', reportRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established');

        await sequelize.sync({ alter: true });
        console.log('Database synchronized');

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
    }
};

startServer();