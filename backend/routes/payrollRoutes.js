import express from 'express';
import Payroll from '../models/Payroll.js';
import Employee from '../models/Employee.js';
import { verifyToken, verifyRole } from '../middleware/authMiddleware.js';
import { computeMonthlyPayrollForEmployee } from '../services/payrollService.js';
import { logAudit } from '../utils/auditLogger.js';
import { createNotification } from '../utils/notify.js';

const router = express.Router();

// 1. Create/Recompute Monthly Payroll Draft (HR or Admin)
router.post('/run', verifyToken, verifyRole(['admin', 'hr']), async (req, res) => {
    try {
        const { month } = req.body;
        const currentMonth = month || new Date().toISOString().slice(0, 7);

        // Check if month is already finalized
        const finalizedCheck = await Payroll.findOne({ month: currentMonth, status: 'finalized' });
        if (finalizedCheck) {
            return res.status(403).json({
                success: false,
                message: `Payroll for ${currentMonth} is finalized and locked. Edits are strictly forbidden.`
            });
        }

        const employees = await Employee.find({ status: { $ne: 'exited' } });
        if (employees.length === 0) {
            return res.status(400).json({ success: false, message: 'No active employees found on payroll.' });
        }

        const payrollRuns = [];

        for (const emp of employees) {
            const computed = await computeMonthlyPayrollForEmployee(emp, currentMonth);

            const payroll = await Payroll.findOneAndUpdate(
                { employeeId: emp._id, month: currentMonth },
                {
                    ...computed,
                    status: 'draft'
                },
                { upsert: true, new: true }
            );
            payrollRuns.push(payroll);
        }

        await logAudit({
            req,
            action: 'RUN_PAYROLL_DRAFT',
            entity: 'Payroll',
            details: `Generated payroll draft for ${currentMonth} (${payrollRuns.length} employees)`
        });

        res.status(201).json({
            success: true,
            message: `Payroll draft for ${currentMonth} prepared successfully`,
            count: payrollRuns.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. Finalize Payroll Month (ADMIN ONLY - Locks the month)
router.patch('/finalize/:month', verifyToken, verifyRole(['admin']), async (req, res) => {
    try {
        const { month } = req.params;

        const count = await Payroll.countDocuments({ month });
        if (count === 0) {
            return res.status(404).json({ success: false, message: `No draft payroll found for ${month}. Run payroll draft first.` });
        }

        await Payroll.updateMany(
            { month },
            { 
                status: 'finalized',
                finalizedBy: req.user.id,
                finalizedAt: new Date()
            }
        );

        await logAudit({
            req,
            action: 'FINALIZE_PAYROLL',
            entity: 'Payroll',
            details: `Finalized and locked payroll for month: ${month}`
        });

        // Send notifications to all affected employees
        const finalizedRecords = await Payroll.find({ month }).populate('employeeId');
        for (const p of finalizedRecords) {
            if (p.employeeId?.userId) {
                await createNotification({
                    userId: p.employeeId.userId,
                    title: 'Payslip Available',
                    message: `Your payslip for ${month} has been finalized and is now available for download.`,
                    type: 'payroll',
                    link: '/employee/payslips'
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Payroll for ${month} finalized and locked successfully.`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. Get Payroll by Month (Admin / HR)
router.get('/:month', verifyToken, verifyRole(['admin', 'hr']), async (req, res) => {
    try {
        const { month } = req.params;
        const payrolls = await Payroll.find({ month })
            .populate({
                path: 'employeeId',
                populate: { path: 'userId', select: 'name email' }
            });

        const totalCost = payrolls.reduce((acc, p) => acc + (p.netSalary || 0), 0);
        const finalizedCount = payrolls.filter(p => p.status === 'finalized').length;

        res.status(200).json({ 
            success: true, 
            payrolls, 
            summary: {
                totalCost,
                count: payrolls.length,
                finalizedCount,
                isAllFinalized: payrolls.length > 0 && finalizedCount === payrolls.length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. Employee views their own payslips (Server-side Scoped to JWT)
router.get('/my/payslips', verifyToken, async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user.id });
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee profile not found' });
        }

        const payrolls = await Payroll.find({ employeeId: employee._id })
            .populate({
                path: 'employeeId',
                populate: { path: 'userId', select: 'name email' }
            })
            .sort({ month: -1 });

        res.status(200).json({ success: true, payrolls });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 5. Get Payroll by Employee ID (HR / Admin or authorized Employee)
router.get('/employee/:employeeId', verifyToken, async (req, res) => {
    try {
        const targetEmp = await Employee.findById(req.params.employeeId);
        if (!targetEmp) {
            return res.status(404).json({ success: false, message: 'Employee record not found' });
        }

        // Scope check: If employee, ensure they are requesting their OWN records
        if (req.user.role === 'employee' && targetEmp.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Forbidden: You cannot view another employee salary.' });
        }

        const payrolls = await Payroll.find({ employeeId: req.params.employeeId })
            .populate({
                path: 'employeeId',
                populate: { path: 'userId', select: 'name email' }
            })
            .sort({ month: -1 });

        res.status(200).json({ success: true, payrolls });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
