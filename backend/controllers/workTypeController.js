const WorkType = require('../models/WorkType');

exports.getWorkTypes = async (req, res) => {
    try {
        const workTypes = await WorkType.findAll({
            order: [['work_id', 'ASC']]
        });
        return res.status(200).json({
            success: true,
            data: workTypes
        });
    } catch (error) {
        console.error('Error in getWorkTypes:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch work types',
            error: error.message
        });
    }
};

exports.addWorkType = async (req, res) => {
    try {
        const { work_type } = req.body;
        
        if (!work_type || work_type.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Work type is required'
            });
        }

        const existingWorkType = await WorkType.findOne({
            where: { work_type: work_type.trim() }
        });

        if (existingWorkType) {
            return res.status(400).json({
                success: false,
                message: 'Work type already exists'
            });
        }

        const newWorkType = await WorkType.create({
            work_type: work_type.trim()
        });

        return res.status(201).json({
            success: true,
            data: newWorkType
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to add work type',
            error: error.message
        });
    }
};

exports.updateWorkType = async (req, res) => {
    try {
        const { work_id } = req.params;
        const { work_type } = req.body;

        if (!work_type || work_type.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Work type is required'
            });
        }

        const workType = await WorkType.findByPk(work_id);
        if (!workType) {
            return res.status(404).json({
                success: false,
                message: 'Work type not found'
            });
        }

        await workType.update({ work_type: work_type.trim() });

        return res.status(200).json({
            success: true,
            data: workType
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update work type',
            error: error.message
        });
    }
};

exports.deleteWorkType = async (req, res) => {
    try {
        const { work_id } = req.params;
        
        const workType = await WorkType.findByPk(work_id);
        if (!workType) {
            return res.status(404).json({
                success: false,
                message: 'Work type not found'
            });
        }

        await workType.destroy();

        return res.status(200).json({
            success: true,
            message: 'Work type deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to delete work type',
            error: error.message
        });
    }
};