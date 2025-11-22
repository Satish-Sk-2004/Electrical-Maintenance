const Motor = require('../models/Motor');
const Department = require('../models/Department');
const Machine = require('../models/Machine');
const Make = require('../models/Make');

exports.getMotors = async (req, res) => {
    try {
        const motors = await Motor.findAll({
            include: [
                { model: Department, attributes: ['dept_name'] },
                { model: Machine, attributes: ['machine_number'] },
                { model: Make, attributes: ['make_name'] }
            ],
            order: [['motor_code', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            data: motors
        });
    } catch (error) {
        console.error('Error in getMotors:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch motors',
            error: error.message
        });
    }
};

exports.addMotor = async (req, res) => {
    try {
        const { motor_code, dept_id, machine_id, make_id, motor_name, capacity, kw, rpm, frame_size, voltage, current} = req.body;

        // Validate required fields
        if (!motor_code || !motor_name || !dept_id || !make_id) {
            return res.status(400).json({
                success: false,
                message: 'Motor code, name, department and make are required'
            });
        }

        // Check if motor already exists
        const existingMotor = await Motor.findByPk(motor_code);
        if (existingMotor) {
            return res.status(400).json({
                success: false,
                message: 'Motor with this code already exists'
            });
        }

        const motor = await Motor.create({
            motor_code,
            dept_id,
            machine_id: machine_id || null,
            make_id,
            motor_name,
            capacity,
            kw,
            rpm,
            frame_size,
            voltage,
            current
        });

        const newMotor = await Motor.findByPk(motor_code, {
            include: [
                { model: Department, attributes: ['dept_name'] },
                { model: Machine, attributes: ['machine_number'] },
                { model: Make, attributes: ['make_name'] }
            ]
        });

        return res.status(201).json({
            success: true,
            data: newMotor
        });
    } catch (error) {
        console.error('Error in addMotor:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to add motor',
            error: error.message
        });
    }
};

exports.updateMotor = async (req, res) => {
    try {
        const { motor_code } = req.params;
        const { dept_id, machine_id, make_id, motor_name, capacity, kw, rpm, frame_size, voltage, current } = req.body;

        const motor = await Motor.findByPk(motor_code);
        if (!motor) {
            return res.status(404).json({
                success: false,
                message: 'Motor not found'
            });
        }

        await motor.update({
            dept_id,
            machine_id: machine_id || null,
            make_id,
            motor_name,
            capacity,
            kw,
            rpm,
            frame_size,
            voltage,
            current
        });

        const updatedMotor = await Motor.findByPk(motor_code, {
            include: [
                { model: Department, attributes: ['dept_name'] },
                { model: Machine, attributes: ['machine_number'] },
                { model: Make, attributes: ['make_name'] }
            ]
        });

        return res.status(200).json({
            success: true,
            data: updatedMotor
        });
    } catch (error) {
        console.error('Error in updateMotor:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update motor',
            error: error.message
        });
    }
};

exports.deleteMotor = async (req, res) => {
    try {
        const { motor_code } = req.params;

        const motor = await Motor.findByPk(motor_code);
        if (!motor) {
            return res.status(404).json({
                success: false,
                message: 'Motor not found'
            });
        }

        await motor.destroy();

        return res.status(200).json({
            success: true,
            message: 'Motor deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteMotor:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete motor',
            error: error.message
        });
    }
};

exports.getMotorsByDepartment = async (req, res) => {
    try {
        const { dept_id } = req.query;

        if (!dept_id) {
            return res.status(400).json({
                success: false,
                message: 'Department ID is required'
            });
        }

        const motors = await Motor.findAll({
            where: { dept_id },
            include: [
                { model: Department, attributes: ['dept_name'] },
                { model: Machine, attributes: ['machine_number'] },
                { model: Make, attributes: ['make_name'] }
            ],
            order: [['motor_name', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            data: motors
        });
    } catch (error) {
        console.error('Error in getMotorsByDepartment:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch motors',
            error: error.message
        });
    }
};