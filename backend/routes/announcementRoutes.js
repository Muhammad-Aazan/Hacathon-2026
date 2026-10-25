import express from 'express';
import Announcement from '../models/Announcement.js';

const router = express.Router();

// 1. Get all announcements
router.get('/', async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .populate('createdBy', 'name email role')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, announcements });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. Create announcement
router.post('/', async (req, res) => {
    try {
        const { title, content, priority, targetRole, createdBy, authorName } = req.body;
        if (!title || !content) {
            return res.status(400).json({ success: false, message: 'Title and content required' });
        }

        const announcement = new Announcement({
            title,
            content,
            priority: priority || 'normal',
            targetRole: targetRole || 'all',
            createdBy,
            authorName: authorName || 'HR Team'
        });

        await announcement.save();
        res.status(201).json({ success: true, message: 'Announcement published', announcement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. Delete announcement
router.delete('/:id', async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Announcement deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
