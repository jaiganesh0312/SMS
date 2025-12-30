const { Notification } = require("../models");
const { Op } = require("sequelize");

exports.getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const notifications = await Notification.findAll({
            where: { userId },
            order: [["createdAt", "DESC"]],
            limit: 50
        });

        res.status(200).json({
            success: true,
            message: "Notifications fetched successfully",
            results: notifications.length,
            data: { notifications }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        await Notification.update({ status: "READ" }, {
            where: { id, userId }
        });

        res.status(200).json({
            success: true,
            message: "Notification marked as read"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
