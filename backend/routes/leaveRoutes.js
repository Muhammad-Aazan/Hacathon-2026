import express from 'express';
import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import Department from '../models/Department.js';
import Setting from '../models/Setting.js';
import Holiday from '../models/Holiday.js';
import User from '../models/User.js';
import { createNotification } from '../utils/notify.js';
import { logAudit } from '../utils/auditLogger.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper: Calculate working days excluding weekends and public holidays
export async function calculateWorkingDays(startDate, endDate) {
    const setting = await Setting.findOne();
    const weekends = setting?.weekends || ['Saturday', 'Sunday'];
    const holidays = await Holiday.find();
    const holidayDates = new Set(
        holidays.map(h => new Date(h.date).toISOString().split('T')[0])
    );

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    let count = 0;
    const cur = new Date(startDate);
    const end = new Date(endDate);
    cur.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    while (cur <= end) {
        const dayName = dayNames[cur.getDay()];
        const dateStr = cur.toISOString().split('T')[0];
        const isWeekend = weekends.includes(dayName);
        const isHoliday = holidayDates.has(dateStr);

        if (!isWeekend && !isHoliday) {
            count++;
        }
        cur.setDate(cur.getDate() + 1);
    }
    return count;
}

// 1. Apply for Leave (Employee)
router.post('/apply', async (req, res) => {
    try {
        const { employeeId, leaveType, startDate, endDate, reason } = req.body;

        if (!employeeId || !leaveType || !startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            return res.status(400).json({ success: false, message: 'Start date cannot be after end date' });
        }

        const employee = await Employee.findById(employeeId).populate('userId');
        if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

        // Calculate actual working days excluding weekends and public holidays
        const requestedWorkingDays = await calculateWorkingDays(start, end);

        if (requestedWorkingDays <= 0) {
            return res.status(422).json({
                success: false,
                message: 'Selected date range falls entirely on weekends or public holidays (0 working days).'
            });
        }

        // Check for overlapping leaves
        const overlapping = await Leave.findOne({
            employeeId,
            status: { $in: ['pending', 'approved'] },
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } }
            ]
        });

        if (overlapping) {
            return res.status(422).json({
                success: false,
                message: 'Leave request overlaps with an existing leave application.'
            });
        }

        // Validate paid leave quota if not 'unpaid'
        if (leaveType !== 'unpaid') {
            const dept = await Department.findOne({ name: employee.department });
            const defaultQuotas = { annual: 14, sick: 8, casual: 10 };
            const quotas = dept?.leaveQuotas || defaultQuotas;
            const maxQuota = quotas[leaveType] || 0;

            // Compute used working days for this leave type in current year
            const currentYear = new Date().getFullYear();
            const yearStart = new Date(`${currentYear}-01-01`);
            const yearEnd = new Date(`${currentYear}-12-31`);

            const pastApproved = await Leave.find({
                employeeId,
                leaveType,
                status: 'approved',
                startDate: { $gte: yearStart, $lte: yearEnd }
            });

            let usedWorkingDays = 0;
            for (const l of pastApproved) {
                usedWorkingDays += await calculateWorkingDays(l.startDate, l.endDate);
            }

            const remainingDays = Math.max(0, maxQuota - usedWorkingDays);

            if (requestedWorkingDays > remainingDays) {
                return res.status(422).json({
                    success: false,
                    message: `Requested ${requestedWorkingDays} working days exceeds your remaining ${leaveType} leave balance (${remainingDays} days remaining of ${maxQuota}).`
                });
            }
        }

        const newLeave = new Leave({
            employeeId,
            leaveType,
            startDate: start,
            endDate: end,
            reason: reason || 'Personal Leave Request'
        });

        await newLeave.save();

        // Notify HR users
        const hrUsers = await User.find({ role: { $in: ['admin', 'hr'] } });
        for (const hr of hrUsers) {
            await createNotification({
                userId: hr._id,
                title: 'New Leave Application',
                message: `${employee.userId?.name || 'Employee'} applied for ${requestedWorkingDays} day(s) of ${leaveType} leave.`,
                type: 'leave',
                link: '/hr/leave/approvals'
            });
        }

        res.status(201).json({
            success: true,
            message: `Leave application submitted successfully (${requestedWorkingDays} working days).`,
            leave: newLeave,
            workingDays: requestedWorkingDays
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. Get all leave applications (HR / Admin)
router.get('/', async (req, res) => {
    try {
        const { status, employeeId } = req.query;
        let query = {};
        if (status && status !== 'all') query.status = status;
        if (employeeId) query.employeeId = employeeId;

        const leaves = await Leave.find(query)
            .populate({
                path: 'employeeId',
                populate: { path: 'userId', select: 'name email' }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, leaves });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. Get my leaves (Employee)
router.get('/my/:employeeId', async (req, res) => {
    try {
        const leaves = await Leave.find({ employeeId: req.params.employeeId })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, leaves });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. Cancel Leave Application (Employee)
router.delete('/:id', async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });

        if (leave.status === 'cancelled') {
            return res.status(400).json({ success: false, message: 'Leave is already cancelled' });
        }

        leave.status = 'cancelled';
        await leave.save();

        if (req.user) {
            await logAudit({
                req,
                action: status === 'approved' ? 'APPROVE_LEAVE' : status === 'rejected' ? 'REJECT_LEAVE' : 'CANCEL_LEAVE',
                entity: 'Leave',
                entityId: leave._id,
                details: `Leave request for ${leave.employeeId?.userId?.name || 'Employee'} (${leave.leaveType}) was marked as ${status}.${comment ? ` Review note: "${comment}"` : ''}`,
                after: { status, comment }
            });
        }

        res.status(200).json({ success: true, message: 'Leave application cancelled successfully', leave });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 5. Approve or Reject Leave (HR / Admin)
router.patch('/:id/status', async (req, res) => {
    try {
        const { status, comment, hrUserId } = req.body;

        if (!['approved', 'rejected', 'cancelled'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Status must be approved, rejected, or cancelled' });
        }

        const leave = await Leave.findById(req.params.id).populate({
            path: 'employeeId',
            populate: { path: 'userId', select: 'name email _id' }
        });

        if (!leave) {
            return res.status(404).json({ success: false, message: 'Leave request not found' });
        }

        leave.status = status;
        if (comment) leave.comment = comment;
        if (hrUserId) leave.approvedBy = hrUserId;

        await leave.save();

        if (req.user) {
            await logAudit({
                req,
                action: status === 'approved' ? 'APPROVE_LEAVE' : status === 'rejected' ? 'REJECT_LEAVE' : 'CANCEL_LEAVE',
                entity: 'Leave',
                entityId: leave._id,
                details: `Leave request for ${leave.employeeId?.userId?.name || 'Employee'} (${leave.leaveType}) was marked as ${status}.${comment ? ` Review note: "${comment}"` : ''}`,
                after: { status, comment }
            });
        }

        // Notify Employee
        if (leave.employeeId?.userId?._id) {
            await createNotification({
                userId: leave.employeeId.userId._id,
                title: `Leave ${status.toUpperCase()}`,
                message: `Your ${leave.leaveType} leave request has been ${status}.${comment ? ` Note: "${comment}"` : ''}`,
                type: 'leave',
                link: '/employee/leave/my-requests'
            });
        }

        res.status(200).json({ success: true, message: `Leave request ${status}`, leave });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 6. Get Leave Balance with exact working days
router.get('/balance/:employeeId', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.employeeId);
        if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

        const dept = await Department.findOne({ name: employee.department });
        const defaultQuotas = { annual: 14, sick: 8, casual: 10, unpaid: 999 };
        const quotas = dept?.leaveQuotas || defaultQuotas;

        const currentYear = new Date().getFullYear();
        const yearStart = new Date(`${currentYear}-01-01`);
        const yearEnd = new Date(`${currentYear}-12-31`);

        const approvedLeaves = await Leave.find({
            employeeId: employee._id,
            status: 'approved',
            startDate: { $gte: yearStart, $lte: yearEnd }
        });

        const used = { annual: 0, sick: 0, casual: 0, unpaid: 0 };
        for (const l of approvedLeaves) {
            const workingDays = await calculateWorkingDays(l.startDate, l.endDate);
            if (used[l.leaveType] !== undefined) {
                used[l.leaveType] += workingDays;
            }
        }

        const balance = {
            annual: { total: quotas.annual || 14, used: used.annual, remaining: Math.max(0, (quotas.annual || 14) - used.annual) },
            sick: { total: quotas.sick || 8, used: used.sick, remaining: Math.max(0, (quotas.sick || 8) - used.sick) },
            casual: { total: quotas.casual || 10, used: used.casual, remaining: Math.max(0, (quotas.casual || 10) - used.casual) },
            unpaid: { total: 'Unlimited', used: used.unpaid, remaining: 'Unlimited' },
        };

        res.status(200).json({ success: true, balance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
