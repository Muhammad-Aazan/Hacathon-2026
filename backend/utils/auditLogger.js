import AuditLog from '../models/AuditLog.js';

export const logAudit = async ({ req, action, entity, entityId, details, before, after }) => {
    try {
        if (!req.user) return;
        const log = new AuditLog({
            actorId: req.user.id,
            actorName: req.user.name || 'System User',
            actorRole: req.user.role,
            action,
            entity,
            entityId: entityId ? String(entityId) : undefined,
            details,
            before,
            after,
            ipAddress: req.ip || req.connection?.remoteAddress,
        });
        await log.save();
    } catch (err) {
        console.error('Audit logging failed:', err.message);
    }
};

export default logAudit;
