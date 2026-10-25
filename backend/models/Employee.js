import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employeeId: { type: String, required: true, unique: true }, // e.g. EMP-001
    employeeCode: { type: String }, // Legacy field fallback
    department: { type: String, required: true },
    designation: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    salaryStructure: {
        basic: { type: Number, required: true },
        hra: { type: Number, default: 0 }, // 40% of basic
        medical: { type: Number, default: 0 }, // 10% of basic
        allowances: { type: Number, default: 0 },
        gross: { type: Number } // 1.5 * basic + allowances
    },
    // Face Recognition enrollment data (Optional bonus feature per PDF)
    faceDescriptor: { type: [Number], default: [] },
    isFaceEnrolled: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'probation', 'exited'], default: 'probation' }
}, { timestamps: true });

// Auto-populate employeeCode with employeeId before validation
employeeSchema.pre('validate', function() {
    if (!this.employeeCode && this.employeeId) {
        this.employeeCode = this.employeeId;
    }
    // Calculate strict PDF salary formulas if basic provided
    if (this.salaryStructure && this.salaryStructure.basic) {
        const basic = Number(this.salaryStructure.basic) || 0;
        const allow = Number(this.salaryStructure.allowances) || 0;
        this.salaryStructure.hra = Math.round(basic * 0.40);
        this.salaryStructure.medical = Math.round(basic * 0.10);
        this.salaryStructure.gross = Math.round((basic * 1.50) + allow);
    }
});

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
