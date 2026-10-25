import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // e.g. Engineering, HR
    designations: [{ type: String }], // e.g. Software Engineer, Team Lead
    leaveQuotas: {
        annual: { type: Number, default: 14 }, //[cite: 5]
        sick: { type: Number, default: 8 },   //[cite: 5]
        casual: { type: Number, default: 10 } //[cite: 5]
    }
}, { timestamps: true });

const Department = mongoose.model('Department', departmentSchema);
export default Department;