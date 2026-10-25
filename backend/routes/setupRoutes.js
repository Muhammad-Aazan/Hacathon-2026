import express from 'express';
import Setting from '../models/Setting.js';
import Department from '../models/Department.js';
import Holiday from '../models/Holiday.js';
import { logAudit } from '../utils/auditLogger.js';

const router = express.Router();

// 1. Settings Get & Update
router.get('/settings', async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create({
                companyName: 'HCM Lite Technologies',
                officeStartTime: '09:00',
                graceTimeMinutes: 15,
                halfDayThresholdHours: 5,
                weekends: ['Saturday', 'Sunday'],
                officeLocation: { latitude: 24.8607, longitude: 67.0011, radiusMeters: 150 }
            });
        }
        res.status(200).json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/settings', async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (settings) {
            settings = await Setting.findOneAndUpdate({}, req.body, { new: true });
        } else {
            settings = new Setting(req.body);
            await settings.save();
        }

        if (req.user) {
            await logAudit({
                req,
                action: 'UPDATE_COMPANY_SETTINGS',
                entity: 'Setting',
                details: 'Updated company profile, office timing or GPS coordinates.',
                after: req.body
            });
        }
        res.status(200).json({ success: true, message: 'Settings saved successfully', settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. Departments
router.get('/departments', async (req, res) => {
    try {
        const departments = await Department.find().sort({ name: 1 });
        res.status(200).json({ success: true, departments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/departments', async (req, res) => {
    try {
        const { name, designations, leaveQuotas } = req.body;
        const newDept = new Department({ 
            name, 
            designations: designations || [], 
            leaveQuotas: leaveQuotas || { annual: 14, sick: 8, casual: 10 } 
        });
        await newDept.save();
        res.status(201).json({ success: true, message: 'Department created', department: newDept });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/departments/:id', async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, message: 'Department updated', department });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/departments/:id', async (req, res) => {
    try {
        await Department.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Department deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. Designations
router.get('/designations', async (req, res) => {
    try {
        const departments = await Department.find();
        const designations = [];
        departments.forEach(d => {
            if (Array.isArray(d.designations)) {
                d.designations.forEach(desig => {
                    if (!designations.includes(desig)) designations.push(desig);
                });
            }
        });
        res.status(200).json({ success: true, designations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. Holidays
router.get('/holidays', async (req, res) => {
    try {
        const holidays = await Holiday.find().sort({ date: 1 });
        res.status(200).json({ success: true, holidays });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/holidays', async (req, res) => {
    try {
        const holiday = new Holiday(req.body);
        await holiday.save();
        res.status(201).json({ success: true, message: 'Holiday added', holiday });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/holidays/:id', async (req, res) => {
    try {
        await Holiday.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Holiday deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
