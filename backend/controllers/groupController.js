const Group = require('../models/Group');

exports.getGroups = async (req, res) => {
    try {
        const groups = await Group.findAll({
            order: [['group_id', 'ASC']]
        });
        return res.status(200).json({
            success: true,
            data: groups
        });
    } catch (error) {
        console.error('Error in getGroups:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch groups',
            error: error.message
        });
    }
};

exports.addGroup = async (req, res) => {
    try {
        const { group_name } = req.body;
        
        if (!group_name || group_name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Group name is required'
            });
        }

        const existingGroup = await Group.findOne({
            where: { group_name: group_name.trim() }
        });

        if (existingGroup) {
            return res.status(400).json({
                success: false,
                message: 'Group name already exists'
            });
        }

        const newGroup = await Group.create({
            group_name: group_name.trim()
        });

        return res.status(201).json({
            success: true,
            data: newGroup
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to add group',
            error: error.message
        });
    }
};

exports.updateGroup = async (req, res) => {
    try {
        const { group_id } = req.params;
        const { group_name } = req.body;

        if (!group_name || group_name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Group name is required'
            });
        }

        const group = await Group.findByPk(group_id);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        await group.update({ group_name: group_name.trim() });

        return res.status(200).json({
            success: true,
            data: group
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update group',
            error: error.message
        });
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const { group_id } = req.params;
        
        const group = await Group.findByPk(group_id);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        await group.destroy();

        return res.status(200).json({
            success: true,
            message: 'Group deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to delete group',
            error: error.message
        });
    }
};