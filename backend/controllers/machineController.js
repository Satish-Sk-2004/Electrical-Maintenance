const Machine = require('../models/Machine');
const Department = require('../models/Department');
const Make = require('../models/Make');

exports.getMachines = async (req, res) => {
    try {
        const machines = await Machine.findAll({
            include: [
                { model: Department, attributes: ['dept_name'] },
                { model: Make, attributes: ['make_name'] }
            ],
            order: [['machine_id', 'ASC']]
        });
        return res.status(200).json({
            success: true,
            data: machines
        });
    } catch (error) {
        console.error('Error in getMachines:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch machines',
            error: error.message
        });
    }
};

exports.getDepartments = async (req, res) => {
    try {
        const departments = await Department.findAll({
            order: [['dept_name', 'ASC']]
        });
        return res.status(200).json({
            success: true,
            data: departments
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch departments',
            error: error.message
        });
    }
};

exports.getMakes = async (req, res) => {
    try {
        const makes = await Make.findAll({
            order: [['make_name', 'ASC']]
        });
        return res.status(200).json({
            success: true,
            data: makes
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch makes',
            error: error.message
        });
    }
};

exports.addMachine = async (req, res) => {
    try {
        const newMachine = await Machine.create(req.body);
        return res.status(201).json({
            success: true,
            data: newMachine
        });
    } catch (error) {
        console.error('Error in addMachine:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to add machine',
            error: error.message
        });
    }
};

exports.updateMachine = async (req, res) => {
    try {
        const { machine_id } = req.params;
        const machine = await Machine.findByPk(machine_id);
        
        if (!machine) {
            return res.status(404).json({
                success: false,
                message: 'Machine not found'
            });
        }

        await machine.update(req.body);

        const updatedMachine = await Machine.findByPk(machine_id, {
            include: [
                { model: Department, attributes: ['dept_name'] },
                { model: Make, attributes: ['make_name'] }
            ]
        });

        return res.status(200).json({
            success: true,
            data: updatedMachine
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update machine',
            error: error.message
        });
    }
};

exports.deleteMachine = async (req, res) => {
    try {
        const { machine_id } = req.params;
        const machine = await Machine.findByPk(machine_id);
        
        if (!machine) {
            return res.status(404).json({
                success: false,
                message: 'Machine not found'
            });
        }

        await machine.destroy();

        return res.status(200).json({
            success: true,
            message: 'Machine deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to delete machine',
            error: error.message
        });
    }
};