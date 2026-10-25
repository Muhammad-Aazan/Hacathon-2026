import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actorName: { type: String, required: true },
    actorRole: { type: String, enum: ['admin', 'hr', 'employee'], required: true },
    action: { type: String, required: true }, // e.g., 'CREATE_EMPLOYEE', 'APPROVE_LEAVE', 'FINALIZE_PAYROLL'
    entity: { type: String, required: true }, // e.g., 'Employee', 'Leave', 'Payroll', 'Setting'
    entityId: { type: String },
    details: { type: String },
    before: { type: mongoose.Schema.Types.Mixed },
    after: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String },
}, { timestamps: true });

// Audit logs are strictly immutable: no updates or deletes allowed
auditLogSchema.pre('updateOne', function() {
    throw new Error('Audit logs are strictly immutable and cannot be updated');
});
auditLogSchema.pre('deleteOne', function() {
    throw new Error('Audit logs are strictly immutable and cannot be deleted');
});

export default mongoose.model('AuditLog', auditLogSchema);
