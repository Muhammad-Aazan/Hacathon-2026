import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Holiday from '../models/Holiday.js';
import Setting from '../models/Setting.js';

export const calculateTax = (annualGross) => {
    if (annualGross <= 600000) return 0;
    if (annualGross <= 1200000) return Math.round((annualGross - 600000) * 0.05);
    if (annualGross <= 2400000) return Math.round(30000 + (annualGross - 1200000) * 0.15);
    if (annualGross <= 3600000) return Math.round(210000 + (annualGross - 2400000) * 0.25);
    return Math.round(510000 + (annualGross - 3600000) * 0.35);
};

export const getMonthWorkingDays = async (year, monthIndex) => {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    let workingDays = 0;

    const startOfMonth = new Date(year, monthIndex, 1);
    const endOfMonth = new Date(year, monthIndex, daysInMonth, 23, 59, 59);

    const holidays = await Holiday.find({
        date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    const holidayDates = new Set(holidays.map(h => new Date(h.date).toISOString().split('T')[0]));

    for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, monthIndex, day);
        const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
        const dateStr = d.toISOString().split('T')[0];

        // Exclude weekends (Saturday & Sunday) and public holidays
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDates.has(dateStr)) {
            workingDays++;
        }
    }
    return Math.max(1, workingDays);
};

export const computeMonthlyPayrollForEmployee = async (employee, monthStr) => {
    const [yearStr, monthNumStr] = monthStr.split('-');
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthNumStr, 10) - 1;

    const workingDays = await getMonthWorkingDays(year, monthIndex);

    const basic = Number(employee.salaryStructure?.basic) || 0;
    const hra = Math.round(basic * 0.40);
    const medical = Math.round(basic * 0.10);
    const allow = Number(employee.salaryStructure?.allowances) || 0;
    const gross = (basic * 1.50) + allow;

    const perDaySalary = parseFloat((gross / workingDays).toFixed(2));

    // Attendance records for the month
    const attendances = await Attendance.find({
        employeeId: employee._id,
        date: { $regex: `^${monthStr}` }
    });

    let presentDays = 0;
    let lateDays = 0;
    let halfDays = 0;
    attendances.forEach(a => {
        if (a.status === 'present') presentDays++;
        else if (a.status === 'late') { presentDays++; lateDays++; }
        else if (a.status === 'half_day') halfDays++;
    });

    // Unpaid approved leaves
    const unpaidLeaves = await Leave.find({
        employeeId: employee._id,
        leaveType: 'unpaid',
        status: 'approved',
        startDate: { $gte: new Date(year, monthIndex, 1) },
        endDate: { $lte: new Date(year, monthIndex + 1, 0) }
    });

    let unpaidLeaveDays = 0;
    unpaidLeaves.forEach(l => {
        const diff = Math.ceil(Math.abs(new Date(l.endDate) - new Date(l.startDate)) / (1000 * 60 * 60 * 24)) + 1;
        unpaidLeaveDays += diff;
    });

    // Calculate absent days (workingDays - present - half - approved paid leaves)
    const paidLeaves = await Leave.find({
        employeeId: employee._id,
        leaveType: { $in: ['annual', 'sick', 'casual'] },
        status: 'approved',
        startDate: { $gte: new Date(year, monthIndex, 1) },
        endDate: { $lte: new Date(year, monthIndex + 1, 0) }
    });

    let paidLeaveDays = 0;
    paidLeaves.forEach(l => {
        const diff = Math.ceil(Math.abs(new Date(l.endDate) - new Date(l.startDate)) / (1000 * 60 * 60 * 24)) + 1;
        paidLeaveDays += diff;
    });

    const recordedDays = presentDays + halfDays + paidLeaveDays + unpaidLeaveDays;
    const absentDays = Math.max(0, workingDays - recordedDays);

    // Deductions per PDF formula: deduct absent + unpaid + (0.5 * half days)
    const deductionUnits = absentDays + unpaidLeaveDays + (0.5 * halfDays);
    const deductions = Math.round(deductionUnits * perDaySalary);

    // Tax calculation on Gross * 12
    const annualGross = gross * 12;
    const annualTax = calculateTax(annualGross);
    const monthlyTax = Math.round(annualTax / 12);

    const netSalary = Math.max(0, Math.round(gross - deductions - monthlyTax));

    return {
        basicSalary: basic,
        hra,
        medical,
        grossSalary: gross,
        workingDays,
        absentDays,
        unpaidLeaveDays,
        halfDays,
        perDaySalary,
        deductions,
        tax: monthlyTax,
        netSalary
    };
};
