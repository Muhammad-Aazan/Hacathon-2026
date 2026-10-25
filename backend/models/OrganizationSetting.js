import mongoose from 'mongoose';

const orgSettingSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    officeStartTime: { type: String, default: "09:00" },
    graceTimeMinutes: { type: Number, default: 15 },
    weekendDays: { type: [String], default: ["Saturday", "Sunday"] },
    officeLocation: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        radiusMeters: { type: Number, default: 150 }
    }
}, { timestamps: true });

export default mongoose.model('OrganizationSetting', orgSettingSchema);