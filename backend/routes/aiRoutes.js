import express from 'express';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';
import Department from '../models/Department.js';
import Setting from '../models/Setting.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper: Format date to YYYY-MM-DD
const formatDate = (date) => date.toISOString().split('T')[0];

// 1. POST /api/ai/smart-leave - Smart Leave Form Free-text Parser
router.post('/smart-leave', verifyToken, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || typeof text !== 'string') {
            return res.status(400).json({ success: false, message: 'Text input is required' });
        }

        const lower = text.toLowerCase();
        let leaveType = 'casual';
        if (lower.includes('sick') || lower.includes('fever') || lower.includes('doctor') || lower.includes('ill') || lower.includes('bimar') || lower.includes('tabiyat')) {
            leaveType = 'sick';
        } else if (lower.includes('annual') || lower.includes('vacation') || lower.includes('holiday') || lower.includes('chutti')) {
            leaveType = 'annual';
        } else if (lower.includes('unpaid') || lower.includes('without pay')) {
            leaveType = 'unpaid';
        } else if (lower.includes('urgent') || lower.includes('casual') || lower.includes('family') || lower.includes('emergency')) {
            leaveType = 'casual';
        }

        const today = new Date();
        let startDate = new Date();
        let daysCount = 1;

        if (lower.includes('tomorrow') || lower.includes('kal')) {
            startDate.setDate(today.getDate() + 1);
        } else if (lower.includes('next week') || lower.includes('aglay hafte')) {
            startDate.setDate(today.getDate() + 7);
        }

        // Check for day count mentions like "2 days", "3 days", "one week"
        const dayMatch = lower.match(/(\d+)\s*days?/);
        if (dayMatch) {
            daysCount = parseInt(dayMatch[1], 10) || 1;
        } else if (lower.includes('half day')) {
            daysCount = 1;
        } else if (lower.includes('week')) {
            daysCount = 5;
        }

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + Math.max(0, daysCount - 1));

        const parsed = {
            leaveType,
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            days: daysCount,
            reason: text.trim()
        };

        res.status(200).json({
            success: true,
            parsed,
            message: 'Leave details parsed successfully. Please review before submission.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. POST /api/ai/chat - Role-Aware Natural Language Assistant
router.post('/chat', verifyToken, async (req, res) => {
    try {
        const { prompt, employeeId } = req.body;
        const role = req.user.role;

        if (!prompt) {
            return res.status(400).json({ success: false, message: 'prompt is required' });
        }

        const lp = prompt.toLowerCase();
        let responseMessage = "I am your HCM Lite AI Assistant. How can I help you today?";
        let data = null;

        // --- Security Check: Employee asking about peers / company finances ---
        if (role === 'employee' && (
            lp.includes('colleague') || lp.includes('other employee') ||
            lp.includes('ali') || lp.includes('ahmed') || lp.includes('someone else') ||
            (lp.includes('salary') && !lp.includes('my salary') && !lp.includes('my payslip')) ||
            lp.includes('all salaries') || lp.includes('highest salary') || lp.includes('payroll total')
        )) {
            return res.status(200).json({
                success: true,
                answer: "🔒 **Access Restricted:** Company security policy strictly prevents employees from viewing confidential peer salaries or company-wide payroll statistics.",
                data: null,
                source: 'HCM-Lite Security Guard'
            });
        }

        // --- Policy Q&A: Office Timing, Grace Period, Half-Day ---
        if (lp.includes('timing') || lp.includes('office hour') || lp.includes('grace period') || lp.includes('start time') || lp.includes('policy')) {
            const setting = await Setting.findOne();
            const start = setting?.officeStartTime || '09:00';
            const grace = setting?.graceTimeMinutes || 15;
            const halfDay = setting?.halfDayThresholdHours || 5;
            responseMessage = `**Company Timing & Attendance Policy:**\n- Office starts at **${start} AM**.\n- Grace period is **${grace} minutes** (marked Late after 09:${grace < 10 ? '0' + grace : grace}).\n- Working under **${halfDay} hours** is marked as a **Half-Day**.\n- Weekends are **Saturday and Sunday**.`;
            data = { start, grace, halfDay };
        }
        // --- Policy Q&A: Leave Policy ---
        else if (lp.includes('leave rule') || lp.includes('leave quota') || lp.includes('how many leave') || lp.includes('types of leave')) {
            responseMessage = `**Annual Leave Entitlements (per Department Rules):**\n- **Annual Leave:** 14 paid days\n- **Sick Leave:** 8 paid days\n- **Casual Leave:** 10 paid days\n- **Unpaid Leave:** Unlimited (salary deducted)\n*Note: Leaves exclude weekends and public holidays.*`;
            data = { annual: 14, sick: 8, casual: 10, unpaid: 'unlimited' };
        }
        // --- Policy Q&A: Tax Slabs ---
        else if (lp.includes('tax') || lp.includes('income tax') || lp.includes('tax slab')) {
            responseMessage = `**Annual Progressive Tax Slabs (Section 3 of PDF):**\n1. **Up to PKR 600,000:** 0%\n2. **PKR 600,001 – 1,200,000:** 5% of excess over 600k\n3. **PKR 1,200,001 – 2,400,000:** PKR 30,000 + 15% of excess over 1.2M\n4. **PKR 2,400,001 – 3,600,000:** PKR 210,000 + 25% of excess over 2.4M\n5. **Above PKR 3,600,000:** PKR 510,000 + 35% of excess over 3.6M`;
            data = { slabs: 5 };
        }
        // --- Headcount (Admin/HR only) ---
        else if (lp.includes('headcount') || lp.includes('how many employees') || lp.includes('total employees')) {
            if (role === 'employee') {
                responseMessage = "As an employee, your scope is focused on personal records. Please consult HR for company headcount.";
            } else {
                const count = await Employee.countDocuments({ status: { $ne: 'exited' } });
                responseMessage = `The total active employee headcount is **${count}**.`;
                data = { headcount: count };
            }
        }
        // --- Today's Attendance ---
        else if (lp.includes('attendance') && (lp.includes('today') || lp.includes('present'))) {
            const today = formatDate(new Date());
            if (role === 'employee' && employeeId) {
                const record = await Attendance.findOne({ employeeId, date: today });
                responseMessage = record
                    ? `Your attendance today: **${record.status.toUpperCase()}**. Check-in: ${record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : 'N/A'}. Source: ${record.source || 'web'}.`
                    : "You haven't checked in yet today. Don't forget to check in on time!";
                data = record;
            } else {
                const total = await Employee.countDocuments({ status: { $ne: 'exited' } });
                const present = await Attendance.countDocuments({ date: today, status: { $in: ['present', 'late', 'half_day'] } });
                const late = await Attendance.countDocuments({ date: today, status: 'late' });
                responseMessage = `Today's attendance: **${present}/${total}** employees present, **${late}** marked late.`;
                data = { date: today, present, late, absent: total - present, total };
            }
        }
        // --- Late Employees (Admin/HR only) ---
        else if (lp.includes('late') && (lp.includes('employee') || lp.includes('today') || lp.includes('who'))) {
            if (role === 'employee') {
                responseMessage = "You can only view your own punctuality status under Attendance Calendar.";
            } else {
                const today = formatDate(new Date());
                const lateRecords = await Attendance.find({ date: today, status: 'late' })
                    .populate({ path: 'employeeId', populate: { path: 'userId', select: 'name' } });
                responseMessage = lateRecords.length > 0
                    ? `**${lateRecords.length}** employee(s) arrived late today:\n` + lateRecords.map(r => `- ${r.employeeId?.userId?.name || 'Employee'}`).join('\n')
                    : 'No employees are late today. 100% on time!';
                data = { lateCount: lateRecords.length, lateEmployees: lateRecords };
            }
        }
        // --- Leave Balance ---
        else if (lp.includes('leave balance') || lp.includes('my leave') || lp.includes('remaining leave')) {
            if (employeeId) {
                const employee = await Employee.findById(employeeId);
                const dept = await Department.findOne({ name: employee?.department });
                const quotas = dept?.leaveQuotas || { annual: 14, sick: 8, casual: 10 };
                const currentYear = new Date().getFullYear();
                const yearStart = new Date(`${currentYear}-01-01`);
                const yearEnd = new Date(`${currentYear}-12-31`);

                const balance = {};
                for (const type of Object.keys(quotas)) {
                    const approved = await Leave.find({ employeeId, leaveType: type, status: 'approved', startDate: { $gte: yearStart, $lte: yearEnd } });
                    let usedDays = approved.length;
                    balance[type] = { quota: quotas[type], used: usedDays, remaining: Math.max(0, quotas[type] - usedDays) };
                }
                const lines = Object.entries(balance).map(([t, b]) => `**${t.toUpperCase()}**: ${b.remaining} remaining (used ${b.used}/${b.quota})`).join('\n');
                responseMessage = `Your leave balance for ${currentYear}:\n${lines}`;
                data = balance;
            } else {
                responseMessage = 'Please provide your employee ID to check your personalized leave balance.';
            }
        }
        // --- Payroll / Salary ---
        else if (lp.includes('payroll') || lp.includes('salary') || lp.includes('payslip')) {
            if (role === 'employee' && employeeId) {
                const latest = await Payroll.findOne({ employeeId }).sort({ month: -1 });
                responseMessage = latest
                    ? `Your latest payslip for **${latest.month}**:\n- Gross Salary: PKR ${latest.grossSalary}\n- Deductions: PKR ${latest.deductions}\n- Income Tax: PKR ${latest.tax}\n- **Net Salary: PKR ${latest.netSalary}** (Status: ${latest.status})`
                    : 'No processed payslips found in your record yet.';
                data = latest;
            } else if (role !== 'employee') {
                const currentMonth = new Date().toISOString().substring(0, 7);
                const payrolls = await Payroll.find({ month: currentMonth });
                const total = payrolls.reduce((s, p) => s + (p.netSalary || 0), 0);
                responseMessage = `Monthly Payroll summary for **${currentMonth}**:\n- Total Records: **${payrolls.length}**\n- Total Net Payout: **PKR ${total.toLocaleString()}**\n- Status: ${payrolls.some(p => p.status === 'finalized') ? 'Finalized' : 'Draft'}`;
                data = { month: currentMonth, count: payrolls.length, totalCost: total };
            }
        }
        // --- Default Fallback ---
        else {
            responseMessage = `I understand you are asking: "${prompt}".\n\nI can assist you with:\n1. **Company Policies** (work hours, grace period, tax slabs)\n2. **Attendance Checks** (today's status, punctuality)\n3. **Leave Balances** and Smart Leave applications\n4. **Payslip and Payroll** inquiries.`;
        }

        res.status(200).json({
            success: true,
            answer: responseMessage,
            data,
            source: 'HCM-Lite AI Engine'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
