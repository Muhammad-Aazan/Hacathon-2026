import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    month: { type: String, required: true }, // Format: YYYY-MM
    basicSalary: { type: Number, required: true },
    hra: { type: Number, default: 0 },
    medical: { type: Number, default: 0 },
    grossSalary: { type: Number, required: true },
    workingDays: { type: Number, default: 22 },
    absentDays: { type: Number, default: 0 },
    unpaidLeaveDays: { type: Number, default: 0 },
    halfDays: { type: Number, default: 0 },
    perDaySalary: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    status: { type: String, enum: ['draft', 'finalized'], default: 'draft' },
    finalizedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    finalizedAt: { type: Date }
}, { timestamps: true });

payrollSchema.index({ employeeId: 1, month: 1 }, { unique: true });

const Payroll = mongoose.model('Payroll', payrollSchema);
export default Payroll;
