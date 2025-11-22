const Make = require('../models/Make');

exports.getMakes = async (req, res) => {
    try {
        const makes = await Make.findAll({
            order: [['make_id', 'ASC']]
        });
        return res.status(200).json({
            success: true,
            data: makes
        });
    } catch (error) {
        console.error('Error in getMakes:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch makes',
            error: error.message
        });
    }
};

exports.addMake = async (req, res) => {
    try {
        const { make_name } = req.body;
        
        if (!make_name || make_name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Make name is required'
            });
        }

        const existingMake = await Make.findOne({
            where: { make_name: make_name.trim() }
        });

        if (existingMake) {
            return res.status(400).json({
                success: false,
                message: 'Make name already exists'
            });
        }

        const newMake = await Make.create({
            make_name: make_name.trim()
        });

        return res.status(201).json({
            success: true,
            data: newMake
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to add make',
            error: error.message
        });
    }
};

exports.updateMake = async (req, res) => {
    try {
        const { make_id } = req.params;
        const { make_name } = req.body;

        if (!make_name || make_name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Make name is required'
            });
        }

        const make = await Make.findByPk(make_id);
        if (!make) {
            return res.status(404).json({
                success: false,
                message: 'Make not found'
            });
        }

        await make.update({ make_name: make_name.trim() });

        return res.status(200).json({
            success: true,
            data: make
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update make',
            error: error.message
        });
    }
};

exports.deleteMake = async (req, res) => {
    try {
        const { make_id } = req.params;
        
        const make = await Make.findByPk(make_id);
        if (!make) {
            return res.status(404).json({
                success: false,
                message: 'Make not found'
            });
        }

        await make.destroy();

        return res.status(200).json({
            success: true,
            message: 'Make deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to delete make',
            error: error.message
        });
    }
};