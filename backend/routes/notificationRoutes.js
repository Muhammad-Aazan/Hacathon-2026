import express from 'express';
import Notification from '../models/Notification.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/notifications - get notifications for logged in user
router.get('/', verifyToken, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({ userId: req.user.id, read: false });

        res.status(200).json({
            success: true,
            notifications,
            unreadCount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PATCH /api/notifications/:id/read - mark single notification as read
router.patch('/:id/read', verifyToken, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.status(200).json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PATCH /api/notifications/read-all - mark all notifications as read
router.patch('/read-all', verifyToken, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, read: false },
            { read: true }
        );

        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
