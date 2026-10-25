import mongoose from 'mongoose';

const holidaySchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true },
    type: { type: String, enum: ['public', 'optional', 'restricted'], default: 'public' },
    description: { type: String }
}, { timestamps: true });

export default mongoose.model('Holiday', holidaySchema);
