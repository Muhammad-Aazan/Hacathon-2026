import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
    targetRole: { type: String, enum: ['all', 'employee', 'hr', 'admin'], default: 'all' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String, default: 'HR Department' },
    expiresAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Announcement', announcementSchema);
