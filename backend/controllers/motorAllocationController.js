const MotorAllocation = require('../models/MotorAllocation');
const Motor = require('../models/Motor');
const Department = require('../models/Department');
const Machine = require('../models/Machine');
const Make = require('../models/Make');

exports.getAllAllocations = async (req, res) => {
    try {
        const allocations = await MotorAllocation.findAll({
            include: [
                { model: Department, attributes: ['dept_name'] },
                { model: Machine, attributes: ['machine_number'] },
                { 
                    model: Motor, 
                    attributes: ['motor_code', 'motor_name', 'capacity'],
                    include: [
                        { 
                            model: Make, 
                            attributes: ['make_name']
                        }
                    ]
                }
            ],
            order: [['allocation_id', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: allocations
        });
    } catch (error) {
        console.error('Error fetching allocations:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch allocations',
            error: error.message
        });
    }
};

exports.createAllocation = async (req, res) => {
    try {
        const { motor_id, dept_id, machine_id, is_spare, bearing_de, bearing_nde, sl_no } = req.body;

        console.log('Creating allocation with data:', { motor_id, dept_id, machine_id, is_spare, bearing_de, bearing_nde, sl_no });

        // Validate motor exists
        const motor = await Motor.findByPk(motor_id);
        if (!motor) {
            return res.status(400).json({
                success: false,
                message: 'Motor not found'
            });
        }

        // Check if motor is already allocated (only for non-spare)
        if (!is_spare) {
            const existingAllocation = await MotorAllocation.findOne({
                where: { motor_id, is_spare: false }
            });

            if (existingAllocation) {
                return res.status(400).json({
                    success: false,
                    message: 'Motor is already allocated'
                });
            }
        }

        const allocation = await MotorAllocation.create({
            motor_id,
            dept_id: dept_id === 'NONE' || dept_id === null ? null : Number(dept_id),
            machine_id: machine_id === 'NONE' || machine_id === null ? null : Number(machine_id),
            is_spare: is_spare || false,
            bearing_de: bearing_de && bearing_de.trim() ? bearing_de : null,
            bearing_nde: bearing_nde && bearing_nde.trim() ? bearing_nde : null,
            sl_no: sl_no && sl_no.trim() ? sl_no : null
        });

        const newAllocation = await MotorAllocation.findByPk(allocation.allocation_id, {
            include: [
                { model: Department, attributes: ['dept_name'] },
                { model: Machine, attributes: ['machine_number'] },
                { 
                    model: Motor, 
                    attributes: ['motor_code', 'motor_name', 'capacity'],
                    include: [
                        { 
                            model: Make, 
                            attributes: ['make_name']
                        }
                    ]
                }
            ]
        });

        console.log('Allocation created:', newAllocation);

        return res.status(201).json({
            success: true,
            data: newAllocation
        });
    } catch (error) {
        console.error('Error creating allocation:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create allocation',
            error: error.message
        });
    }
};

exports.updateAllocation = async (req, res) => {
    try {
        const { allocation_id } = req.params;
        const { motor_id, dept_id, machine_id, is_spare, bearing_de, bearing_nde, sl_no } = req.body;

        console.log('Updating allocation:', allocation_id, 'with data:', { motor_id, dept_id, machine_id, is_spare, bearing_de, bearing_nde, sl_no });

        const allocation = await MotorAllocation.findByPk(allocation_id);
        if (!allocation) {
            return res.status(404).json({
                success: false,
                message: 'Allocation not found'
            });
        }

        // Validate new motor if different
        if (motor_id !== allocation.motor_id) {
            const motor = await Motor.findByPk(motor_id);
            if (!motor) {
                return res.status(400).json({
                    success: false,
                    message: 'Motor not found'
                });
            }

            // Check if new motor is already allocated
            if (!is_spare) {
                const existingAllocation = await MotorAllocation.findOne({
                    where: { 
                        motor_id, 
                        is_spare: false,
                        allocation_id: { [require('sequelize').Op.ne]: allocation_id } 
                    }
                });

                if (existingAllocation) {
                    return res.status(400).json({
                        success: false,
                        message: 'Motor is already allocated'
                    });
                }
            }
        }

        await allocation.update({
            motor_id: motor_id || allocation.motor_id,
            dept_id: dept_id !== undefined && dept_id !== null ? (dept_id === 'NONE' ? null : Number(dept_id)) : allocation.dept_id,
            machine_id: machine_id !== undefined && machine_id !== null ? (machine_id === 'NONE' ? null : Number(machine_id)) : allocation.machine_id,
            is_spare: is_spare !== undefined ? is_spare : allocation.is_spare,
            bearing_de: bearing_de && bearing_de.trim() ? bearing_de : null,
            bearing_nde: bearing_nde && bearing_nde.trim() ? bearing_nde : null,
            sl_no: sl_no && sl_no.trim() ? sl_no : null
        });

        const updatedAllocation = await MotorAllocation.findByPk(allocation_id, {
            include: [
                { model: Department, attributes: ['dept_name'] },
                { model: Machine, attributes: ['machine_number'] },
                { 
                    model: Motor, 
                    attributes: ['motor_code', 'motor_name', 'capacity'],
                    include: [
                        { 
                            model: Make, 
                            attributes: ['make_name']
                        }
                    ]
                }
            ]
        });

        console.log('Allocation updated:', updatedAllocation);

        return res.status(200).json({
            success: true,
            data: updatedAllocation
        });
    } catch (error) {
        console.error('Error updating allocation:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update allocation',
            error: error.message
        });
    }
};

exports.deleteAllocation = async (req, res) => {
    try {
        const { allocation_id } = req.params;

        const allocation = await MotorAllocation.findByPk(allocation_id);
        if (!allocation) {
            return res.status(404).json({
                success: false,
                message: 'Allocation not found'
            });
        }

        await allocation.destroy();

        return res.status(200).json({
            success: true,
            message: 'Allocation deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting allocation:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete allocation',
            error: error.message
        });
    }
};

exports.getMotorsByMachine = async (req, res) => {
    try {
        const { machine_id, dept_id } = req.query;

        if (!machine_id || !dept_id) {
            return res.status(400).json({
                success: false,
                message: 'Machine ID and Department ID are required'
            });
        }

        const allocations = await MotorAllocation.findAll({
            where: {
                machine_id: machine_id === 'NONE' ? null : machine_id,
                dept_id: dept_id === 'NONE' ? null : dept_id
            },
            include: [
                { 
                    model: Motor, 
                    attributes: ['motor_code', 'motor_name', 'capacity', 'make_id']
                }
            ]
        });

        return res.status(200).json({
            success: true,
            data: allocations
        });
    } catch (error) {
        console.error('Error fetching motors by machine:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch motors',
            error: error.message
        });
    }
};

exports.getSpareMotors = async (req, res) => {
    try {
        const spareMotors = await MotorAllocation.findAll({
            where: { is_spare: true },
            include: [
                { 
                    model: Motor, 
                    attributes: ['motor_code', 'motor_name', 'capacity']
                }
            ],
            order: [['allocation_id', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: spareMotors
        });
    } catch (error) {
        console.error('Error fetching spare motors:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch spare motors',
            error: error.message
        });
    }
};