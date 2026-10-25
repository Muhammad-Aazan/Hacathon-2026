import mongoose from 'mongoose';

const correctionSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: String, required: true },
    requestedCheckIn: { type: String },
    requestedCheckOut: { type: String },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewNote: { type: String }
}, { timestamps: true });

export default mongoose.model('AttendanceCorrectionRequest', correctionSchema);
