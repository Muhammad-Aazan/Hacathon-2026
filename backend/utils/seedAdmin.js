// utils/seedAdmin.js
import User from '../models/User.js';
import Department from '../models/Department.js';
import Setting from '../models/Setting.js';
import bcrypt from 'bcryptjs';

export const createDefaultAdmin = async () => {
    try {
        const adminExists = await User.findOne({ email: 'admin@hcm.com' });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('Admin123!', 10);
            
            const admin = new User({
                name: 'System Admin',
                email: 'admin@hcm.com',
                password: hashedPassword,
                role: 'admin'
            });

            await admin.save();
            console.log('✅ Default Admin created: admin@hcm.com / Admin123!');
        }

        // Seed default departments if none
        const deptCount = await Department.countDocuments();
        if (deptCount === 0) {
            await Department.create([
                { name: 'Engineering', designations: ['Software Engineer', 'Frontend Dev', 'Backend Dev', 'Team Lead'], leaveQuotas: { annual: 14, sick: 8, casual: 10 } },
                { name: 'Human Resources', designations: ['HR Manager', 'Recruiter', 'HR Executive'], leaveQuotas: { annual: 14, sick: 8, casual: 10 } },
                { name: 'Sales & Marketing', designations: ['Sales Executive', 'Marketing Lead', 'BDM'], leaveQuotas: { annual: 14, sick: 8, casual: 10 } },
            ]);
            console.log('✅ Default Departments created');
        }

        // Seed default settings if none
        const settingExists = await Setting.findOne();
        if (!settingExists) {
            await Setting.create({
                companyName: 'HCM Lite Global',
                officeStartTime: '09:00',
                graceTimeMinutes: 15,
                halfDayThresholdHours: 5,
                weekends: ['Saturday', 'Sunday'],
                officeLocation: { latitude: 24.8607, longitude: 67.0011, radiusMeters: 150 }
            });
            console.log('✅ Default Settings created');
        }
    } catch (error) {
        console.error('Error in seed data:', error.message);
    }
};

export default createDefaultAdmin;
