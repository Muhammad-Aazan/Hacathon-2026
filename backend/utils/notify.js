import Notification from '../models/Notification.js';

export const createNotification = async ({ userId, title, message, type = 'general', link = '' }) => {
    try {
        if (!userId) return null;
        const notification = new Notification({
            userId,
            title,
            message,
            type,
            link,
        });
        return await notification.save();
    } catch (err) {
        console.error('Failed to create notification:', err.message);
        return null;
    }
};

export default createNotification;
