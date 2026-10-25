import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { verifyToken, verifyRole } from '../middleware/authMiddleware.js';
import { logAudit } from '../utils/auditLogger.js';

const router = express.Router();

// 1. HR/Admin registers a new employee
router.post('/register', async (req, res) => {
    try {
        const { name, email, tempPassword, employeeId, employeeCode, department, designation, phone, address, basicSalary, allowances, status } = req.body;

        const effectiveEmpId = employeeId || employeeCode;

        if (!name || !email || !effectiveEmpId) {
            return res.status(400).json({ success: false, message: 'Name, email, and Employee ID are required' });
        }

        // 1. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }

        const existingEmp = await Employee.findOne({
            $or: [{ employeeId: effectiveEmpId }, { employeeCode: effectiveEmpId }]
        });
        if (existingEmp) {
            return res.status(400).json({ success: false, message: 'Employee ID already registered' });
        }

        // 2. Hash temporary password or default
        const passwordToHash = tempPassword || 'password123';
        const hashedPassword = await bcrypt.hash(passwordToHash, 10);

        // 3. Create User Login (role: employee)
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: 'employee'
        });
        await newUser.save();

        // 4. Calculate Gross Salary
        const basic = Number(basicSalary) || 0;
        const allow = Number(allowances) || 0;
        const gross = basic + allow;

        // 5. Create Employee Profile with both employeeId and employeeCode populated
        const newEmployee = new Employee({
            userId: newUser._id,
            employeeId: effectiveEmpId,
            employeeCode: effectiveEmpId, // Satisfies legacy employeeCode_1 unique index
            department: department || 'General',
            designation: designation || 'Staff',
            phone: phone || '',
            address: address || '',
            salaryStructure: {
                basic,
                allowances: allow,
                gross
            },
            status: status || 'probation'
        });
        await newEmployee.save();

        if (req.user) {
            await logAudit({
                req,
                action: 'REGISTER_EMPLOYEE',
                entity: 'Employee',
                entityId: newEmployee._id,
                details: `Registered employee ${name} (${effectiveEmpId}) in ${newEmployee.department}`,
                after: { employeeId: effectiveEmpId, name, email, department: newEmployee.department }
            });
        }

        res.status(201).json({ 
            success: true, 
            message: 'Employee registered successfully!',
            employee: newEmployee 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. Get all employees (Search, Filter, Pagination)
router.get('/', async (req, res) => {
    try {
        const { department, status, search, page = 1, limit = 50 } = req.query;
        let query = {};

        if (department && department !== 'All') {
            query.department = department;
        }

        if (status && status !== 'All') {
            query.status = status;
        }

        let employees = await Employee.find(query)
            .populate('userId', 'name email role')
            .sort({ createdAt: -1 });

        if (search) {
            const s = search.toLowerCase();
            employees = employees.filter(emp => 
                emp.employeeId?.toLowerCase().includes(s) ||
                emp.employeeCode?.toLowerCase().includes(s) ||
                emp.userId?.name?.toLowerCase().includes(s) ||
                emp.userId?.email?.toLowerCase().includes(s) ||
                emp.department?.toLowerCase().includes(s) ||
                emp.designation?.toLowerCase().includes(s)
            );
        }

        const total = employees.length;
        const startIndex = (page - 1) * limit;
        const paginatedEmployees = employees.slice(startIndex, startIndex + Number(limit));

        res.status(200).json({ 
            success: true, 
            employees: paginatedEmployees,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. Get single employee by ID
router.get('/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id).populate('userId', 'name email role');
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        res.status(200).json({ success: true, employee });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. Get employee by User ID
router.get('/user/:userId', async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.params.userId }).populate('userId', 'name email role');
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee profile not found' });
        }
        res.status(200).json({ success: true, employee });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 5. Update employee
router.put('/:id', async (req, res) => {
    try {
        const { department, designation, phone, address, basicSalary, allowances, status, name } = req.body;
        
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        if (department) employee.department = department;
        if (designation) employee.designation = designation;
        if (phone !== undefined) employee.phone = phone;
        if (address !== undefined) employee.address = address;
        if (status) employee.status = status;

        if (basicSalary !== undefined || allowances !== undefined) {
            const basic = basicSalary !== undefined ? Number(basicSalary) : employee.salaryStructure.basic;
            const allow = allowances !== undefined ? Number(allowances) : employee.salaryStructure.allowances;
            employee.salaryStructure = {
                basic,
                allowances: allow,
                gross: basic + allow
            };
        }

        await employee.save();

        if (name && employee.userId) {
            await User.findByIdAndUpdate(employee.userId, { name });
        }

        const updated = await Employee.findById(employee._id).populate('userId', 'name email role');
        res.status(200).json({ success: true, message: 'Employee updated successfully', employee: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 6. Update Status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const employee = await Employee.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.status(200).json({ success: true, message: 'Status updated', employee });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 7. Delete employee
router.delete('/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

        if (employee.userId) {
            await User.findByIdAndDelete(employee.userId);
        }
        await Employee.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
