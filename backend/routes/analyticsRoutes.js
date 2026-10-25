import express from 'express';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';

const router = express.Router();

const getTodayDate = () => new Date().toISOString().split('T')[0];

// 1. HR Dashboard Analytics
router.get('/hr-dashboard', async (req, res) => {
    try {
        const today = getTodayDate();

        const totalHeadcount = await Employee.countDocuments({ status: { $ne: 'exited' } });
        const presentToday = await Attendance.countDocuments({ date: today, status: { $in: ['present', 'late', 'half_day'] } });
        const lateToday = await Attendance.countDocuments({ date: today, status: 'late' });
        const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
        const onLeave = await Leave.countDocuments({
            status: 'approved',
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });
        const absentToday = Math.max(0, totalHeadcount - presentToday - onLeave);

        res.status(200).json({
            success: true,
            kpis: {
                headcount: totalHeadcount,
                presentToday,
                lateToday,
                pendingApprovals: pendingLeaves,
                onLeave,
                absentToday
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. Admin Dashboard Analytics
router.get('/admin-dashboard', async (req, res) => {
    try {
        const today = getTodayDate();
        const currentMonth = today.slice(0, 7);

        const totalHeadcount = await Employee.countDocuments({ status: { $ne: 'exited' } });
        const presentToday = await Attendance.countDocuments({ date: today, status: { $in: ['present', 'late', 'half_day'] } });
        const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
        const onLeave = await Leave.countDocuments({
            status: 'approved',
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });

        // Payroll sum
        const payrollRecords = await Payroll.find({ month: currentMonth });
        const totalPayroll = payrollRecords.reduce((acc, p) => acc + (p.netSalary || 0), 0);

        res.status(200).json({
            success: true,
            kpis: {
                headcount: totalHeadcount,
                presentToday,
                pendingApprovals: pendingLeaves,
                onLeave,
                totalPayroll,
                payrollFinalized: payrollRecords.some(p => p.status === 'finalized')
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. Employee Dashboard Personal Stats
router.get('/employee-dashboard', async (req, res) => {
    try {
        const { employeeId } = req.query;
        let query = {};
        if (employeeId) query.employeeId = employeeId;

        const currentMonth = new Date().toISOString().slice(0, 7);
        const attendances = await Attendance.find({ 
            ...query, 
            date: { $regex: `^${currentMonth}` } 
        });

        const presentDays = attendances.filter(a => a.status === 'present' || a.status === 'half_day').length;
        const lateDays = attendances.filter(a => a.status === 'late').length;

        const leavesTaken = await Leave.countDocuments({ ...query, status: 'approved' });

        res.status(200).json({
            success: true,
            stats: {
                presentDays,
                lateDays,
                leavesTaken,
                leaveBalance: Math.max(0, 20 - leavesTaken)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. Attendance 30-Day Trend
router.get('/attendance-trend', async (req, res) => {
    try {
        const trend = [];
        const now = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

            const count = await Attendance.countDocuments({ date: dateStr, status: { $in: ['present', 'late', 'half_day'] } });
            trend.push({
                date: dayName,
                fullDate: dateStr,
                presentCount: count
            });
        }

        res.status(200).json({ success: true, trend });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 5. Headcount by Department
router.get('/headcount-by-dept', async (req, res) => {
    try {
        const employees = await Employee.find({ status: { $ne: 'exited' } });
        const deptMap = {};

        employees.forEach(emp => {
            const d = emp.department || 'General';
            deptMap[d] = (deptMap[d] || 0) + 1;
        });

        const departments = Object.keys(deptMap).map(k => ({
            department: k,
            count: deptMap[k]
        }));

        res.status(200).json({ success: true, departments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
