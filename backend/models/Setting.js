import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    officeStartTime: { type: String, default: "09:00" }, //[cite: 5]
    graceTimeMinutes: { type: Number, default: 15 }, //[cite: 5]
    halfDayThresholdHours: { type: Number, default: 5 }, //[cite: 5]
    weekends: { type: [String], default: ["Saturday", "Sunday"] }, //[cite: 5]
    officeLocation: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        radiusMeters: { type: Number, default: 150 } //[cite: 5]
    }
}, { timestamps: true });

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;