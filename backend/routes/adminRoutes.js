import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { verifyToken, verifyRole } from '../middleware/authMiddleware.js';
import { logAudit } from '../utils/auditLogger.js';

const router = express.Router();

// GET /api/admin/users - list all users with pagination
router.get('/users', verifyToken, verifyRole(['admin']), async (req, res) => {
    try {
        const { page = 1, limit = 20, role, search } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const query = {};
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/admin/create-hr - Admin explicitly creates HR login account
router.post('/create-hr', verifyToken, verifyRole(['admin']), async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email and password are required' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ success: false, message: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newHR = new User({
            name,
            email,
            password: hashedPassword,
            role: 'hr',
            isActive: true,
            mustChangePassword: true
        });

        await newHR.save();

        await logAudit({
            req,
            action: 'CREATE_HR_USER',
            entity: 'User',
            entityId: newHR._id,
            details: `Admin created HR account for ${name} (${email})`,
            after: { id: newHR._id, name, email, role: 'hr' }
        });

        const hrData = newHR.toObject();
        delete hrData.password;

        res.status(201).json({
            success: true,
            message: 'HR account created successfully. User must change temporary password on first login.',
            data: hrData
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PATCH /api/admin/users/:id/status - Deactivate or reactivate user login
router.patch('/users/:id/status', verifyToken, verifyRole(['admin']), async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ success: false, message: 'Cannot deactivate your own account' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const previousStatus = user.isActive;
        const newStatus = req.body.isActive !== undefined ? req.body.isActive : !previousStatus;
        user.isActive = newStatus;
        await user.save();

        await logAudit({
            req,
            action: newStatus ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
            entity: 'User',
            entityId: user._id,
            details: `Admin set status of ${user.name} (${user.email}) to ${newStatus ? 'Active' : 'Inactive'}`,
            before: { isActive: previousStatus },
            after: { isActive: newStatus }
        });

        res.status(200).json({
            success: true,
            message: `User ${user.name} is now ${newStatus ? 'Active' : 'Inactive'}`,
            data: { id: user._id, name: user.name, isActive: user.isActive }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/admin/users/:id/reset-password - Admin resets temporary password
router.post('/users/:id/reset-password', verifyToken, verifyRole(['admin']), async (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.mustChangePassword = true;
        await user.save();

        await logAudit({
            req,
            action: 'RESET_USER_PASSWORD',
            entity: 'User',
            entityId: user._id,
            details: `Admin reset password for ${user.name} (${user.email}). User flagged to change password.`,
        });

        res.status(200).json({
            success: true,
            message: `Password reset successfully for ${user.name}. User must change it on next login.`
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/admin/audit-logs - Immutable audit logs for Admin
router.get('/audit-logs', verifyToken, verifyRole(['admin']), async (req, res) => {
    try {
        const { page = 1, limit = 50, action, entity, actorRole, search } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const query = {};
        if (action) query.action = action;
        if (entity) query.entity = entity;
        if (actorRole) query.actorRole = actorRole;
        if (search) {
            query.$or = [
                { actorName: { $regex: search, $options: 'i' } },
                { details: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await AuditLog.countDocuments(query);
        const logs = await AuditLog.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        res.status(200).json({
            success: true,
            data: {
                logs,
                pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/admin/users/:id - get user by ID
router.get('/users/:id', verifyToken, verifyRole(['admin']), async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/admin/users/:id - delete user
router.delete('/users/:id', verifyToken, verifyRole(['admin']), async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await logAudit({
            req,
            action: 'DELETE_USER',
            entity: 'User',
            entityId: user._id,
            details: `Admin deleted user ${user.name} (${user.email})`,
            before: { id: user._id, name: user.name, email: user.email }
        });

        res.status(200).json({ success: true, message: 'User deleted', data: { id: user._id, name: user.name } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PATCH /api/admin/users/:id/role - change user role
router.patch('/users/:id/role', verifyToken, verifyRole(['admin']), async (req, res) => {
    try {
        const { role } = req.body;
        if (!['admin', 'hr', 'employee'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Role must be admin, hr, or employee' });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const previousRole = user.role;
        user.role = role;
        await user.save();

        await logAudit({
            req,
            action: 'CHANGE_USER_ROLE',
            entity: 'User',
            entityId: user._id,
            details: `Admin changed role of ${user.name} from ${previousRole} to ${role}`,
            before: { role: previousRole },
            after: { role }
        });

        const updatedUser = user.toObject();
        delete updatedUser.password;

        res.status(200).json({ success: true, message: 'Role updated successfully', data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
