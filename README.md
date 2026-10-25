# HCM Lite — AI-Assisted Human Capital Management

> Saylani Hackathon 2026 Submission  
> Full-stack MERN application for managing employees, attendance, payroll, and leaves with AI assistance.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js (ES Modules) |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcryptjs + HTTP-Only Cookies |
| State | TanStack Query (React Query) |
| UI Icons | Lucide React |
| Notifications | react-hot-toast |

---

## 🚀 Features

### Role-Based Access Control
- **Admin** — Company setup, HR management, payroll finalization, audit logs
- **HR** — Employee registration, attendance board, leave approvals, payroll drafts
- **Employee** — Check-in/out, leave requests, payslips, personal profile

### Core Modules
- ✅ **M1** — Authentication (JWT + Cookie sessions, role-based routes)
- ✅ **M2** — Organization Setup (company settings, departments, designations, holidays, leave types)
- ✅ **M3** — Employee Management (register, directory, CSV import/export, Employee 360 profile)
- ✅ **M4** — Attendance (check-in/out, face+GPS attendance, daily board, correction workflow)
- ✅ **M5** — Leave Management (apply, cancel, approve/reject, balance tracking)
- ✅ **M6** — Payroll (salary structure, monthly draft, progressive tax, payslip PDF)
- ✅ **M7** — Dashboards & Analytics (role-specific KPIs from real MongoDB data)
- ✅ **M8** — AI Assistant (role-aware chat, smart leave form)
- ✅ **M9** — Communications (announcements, notifications, immutable audit logs)

### Payroll Formula (PDF Spec)
```
HRA        = 40% of Basic Salary
Medical    = 10% of Basic Salary
Gross      = 1.5 × Basic Salary

Tax Slabs (Annual Gross Income):
  0 – 600,000          → 0%
  600,001 – 1,200,000  → 5%
  1,200,001 – 2,400,000 → 30,000 + 15% above 1,200,000
  2,400,001 – 3,600,000 → 210,000 + 25% above 2,400,000
  3,600,001+            → 510,000 + 35% above 3,600,000
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Git

### 1. Clone the repo
```bash
git clone https://github.com/Muhammad-Aazan/HCM-LITE.git
cd HCM-LITE
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and fill in your MONGO_URI and JWT_SECRET
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Run Development Servers

**Backend** (from project root):
```bash
node backend/index.js
```
Server runs on `http://localhost:5000`

**Frontend** (from `/frontend` folder):
```bash
cd frontend
npm run dev
```
App runs on `http://localhost:5173`

---

## 🔐 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hcm.com | Admin123! |

> HR and Employee accounts are created through the Admin/HR portal.

---

## 📁 Project Structure

```
HCM-LITE/
├── backend/
│   ├── config/          # DB connection
│   ├── middleware/       # Auth, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes (admin, auth, employee, attendance, leave, payroll, ai...)
│   ├── services/        # Business logic (payroll calculations)
│   ├── utils/           # Audit logger, notifications, seed admin
│   └── index.js         # Express app entry point
│
└── frontend/
    ├── public/          # Static assets (logo, favicon)
    └── src/
        ├── app/         # Router + route config
        ├── components/  # Shared UI components (Sidebar, Navbar, DataTable...)
        ├── context/     # Auth context
        ├── modules/
        │   ├── admin/       # Admin-only pages
        │   ├── hr/          # HR-only pages
        │   ├── employee/    # Employee pages
        │   ├── auth/        # Login, Signup, ForgotPassword
        │   ├── payroll/     # Payroll dashboard + payslips
        │   ├── leave/       # Leave management
        │   ├── attendance/  # Attendance pages
        │   └── ai-assistant/# AI chat
        └── services/    # Axios API service
```

---

## 📋 API Endpoints (Summary)

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | Auth |
| GET | `/api/auth/me` | Auth |
| GET | `/api/employees` | Admin/HR |
| POST | `/api/employees/register` | Admin/HR |
| POST | `/api/attendance/check-in` | All |
| POST | `/api/attendance/camera-check-in` | All |
| POST | `/api/leave/apply` | All |
| PATCH | `/api/leave/:id/status` | Admin/HR |
| POST | `/api/payroll/run` | Admin/HR |
| PATCH | `/api/payroll/finalize/:month` | Admin only |
| GET | `/api/admin/audit-logs` | Admin only |
| POST | `/api/ai/chat` | Auth |

---

## 🎯 Hackathon Judging Criteria Met

- ✅ Role-separated access (Admin / HR / Employee)
- ✅ No unrestricted public signup
- ✅ PDF formula-compliant payroll calculations
- ✅ Progressive tax slabs implemented
- ✅ Immutable audit logs (AuditLog model blocks updates/deletes)
- ✅ HTTP-Only cookie sessions (no login on refresh)
- ✅ Face + GPS attendance (camera capture + Haversine geofencing)
- ✅ AI assistant with role-aware data scoping
- ✅ Real MongoDB aggregations for dashboard KPIs (no hardcoded data)

---

*Built for Saylani Hackathon 2026 by Muhammad Aazan*
