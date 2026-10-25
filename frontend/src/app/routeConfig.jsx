import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Auth Pages
import Login from "../modules/auth/pages/Login";
import Signup from "../modules/auth/pages/Signup";
import FirstRunSetup from "../modules/auth/pages/FirstRunSetup";
import ChangePassword from "../modules/auth/pages/ChangePassword";
import ForgotPassword from "../modules/auth/pages/ForgotPassword";

// Admin Pages
import AdminDashboard from "../modules/admin/pages/AdminDashboard";
import CompanySettings from "../modules/admin/pages/CompanySettings";
import Departments from "../modules/admin/pages/Departments";
import Designations from "../modules/admin/pages/Designations";
import Holidays from "../modules/admin/pages/Holidays";
import LeaveTypes from "../modules/admin/pages/LeaveTypes";
import UserManagement from "../modules/admin/pages/UserManagement";
import PayrollFinalize from "../modules/admin/pages/PayrollFinalize";
import AuditLogViewer from "../modules/admin/pages/AuditLogViewer";

// HR Pages
import HRDashboard from "../modules/hr/pages/HRDashboard";
import EmployeeDirectory from "../modules/hr/pages/EmployeeDirectory";
import RegisterEmployee from "../modules/hr/pages/RegisterEmployee";
import EmployeeImportExport from "../modules/hr/pages/EmployeeImportExport";
import AttendanceBoard from "../modules/hr/pages/AttendanceBoard";
import AttendanceCorrections from "../modules/hr/pages/AttendanceCorrections";
import LeaveApprovals from "../modules/hr/pages/LeaveApprovals";
import PayrollDraft from "../modules/hr/pages/PayrollDraft";

// Employee Pages
import EmployeeDashboard from "../modules/employee/pages/EmployeeDashboard";
import FaceAttendance from "../modules/employee/pages/FaceAttendance";
import CheckInOut from "../modules/employee/pages/CheckInOut";
import AttendanceCalendar from "../modules/employee/pages/AttendanceCalendar";
import ApplyLeave from "../modules/employee/pages/ApplyLeave";
import MyLeaveRequests from "../modules/employee/pages/MyLeaveRequests";
import LeaveBalance from "../modules/employee/pages/LeaveBalance";
import MyPayslips from "../modules/employee/pages/MyPayslips";
import MyProfile from "../modules/employee/pages/MyProfile";

// Common Shared Pages
import AIAssistant from "../modules/ai-assistant/pages/AIAssistant";
import Announcements from "../modules/communications/pages/Announcements";
import Notifications from "../modules/communications/pages/Notifications";
import EmployeeProfile from "../modules/employees/pages/EmployeeProfile";
import EditEmployee from "../modules/employees/pages/EditEmployee";

// Home Redirect Component
export function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (user.role === "hr") return <Navigate to="/hr/dashboard" replace />;
  return <Navigate to="/employee/dashboard" replace />;
}

export const publicRoutes = [
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/register", element: <Signup /> },
  { path: "/setup", element: <FirstRunSetup /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/change-password", element: <ChangePassword /> },
];

export const protectedRoutes = [
  // Home Redirect
  { path: "/", element: <HomeRedirect /> },

  // Admin Routes (Strict Admin Only)
  { path: "/admin/dashboard", element: <AdminDashboard />, roles: ["admin"] },
  { path: "/admin/settings", element: <CompanySettings />, roles: ["admin"] },
  { path: "/admin/departments", element: <Departments />, roles: ["admin"] },
  { path: "/admin/designations", element: <Designations />, roles: ["admin"] },
  { path: "/admin/holidays", element: <Holidays />, roles: ["admin"] },
  { path: "/admin/leave-types", element: <LeaveTypes />, roles: ["admin"] },
  { path: "/admin/users", element: <UserManagement />, roles: ["admin"] },
  { path: "/admin/payroll", element: <PayrollFinalize />, roles: ["admin"] },
  { path: "/admin/audit-logs", element: <AuditLogViewer />, roles: ["admin"] },

  // HR Routes (Admin & HR)
  { path: "/hr/dashboard", element: <HRDashboard />, roles: ["admin", "hr"] },
  { path: "/hr/employees", element: <EmployeeDirectory />, roles: ["admin", "hr"] },
  { path: "/hr/employees/add", element: <RegisterEmployee />, roles: ["admin", "hr"] },
  { path: "/hr/employees/:id/edit", element: <EditEmployee />, roles: ["admin", "hr"] },
  { path: "/hr/employees/:id", element: <EmployeeProfile />, roles: ["admin", "hr"] },
  { path: "/hr/employees/import-export", element: <EmployeeImportExport />, roles: ["admin", "hr"] },
  { path: "/hr/attendance", element: <AttendanceBoard />, roles: ["admin", "hr"] },
  { path: "/hr/attendance/corrections", element: <AttendanceCorrections />, roles: ["admin", "hr"] },
  { path: "/hr/leave/approvals", element: <LeaveApprovals />, roles: ["admin", "hr"] },
  { path: "/hr/payroll", element: <PayrollDraft />, roles: ["admin", "hr"] },

  // Employee Routes (All Authenticated Staff)
  { path: "/employee/dashboard", element: <EmployeeDashboard />, roles: ["admin", "hr", "employee"] },
  { path: "/employee/attendance/face", element: <FaceAttendance />, roles: ["admin", "hr", "employee"] },
  { path: "/employee/attendance/check-in", element: <CheckInOut />, roles: ["admin", "hr", "employee"] },
  { path: "/employee/attendance/calendar", element: <AttendanceCalendar />, roles: ["admin", "hr", "employee"] },
  { path: "/employee/leave/apply", element: <ApplyLeave />, roles: ["admin", "hr", "employee"] },
  { path: "/employee/leave/my-requests", element: <MyLeaveRequests />, roles: ["admin", "hr", "employee"] },
  { path: "/employee/leave/balance", element: <LeaveBalance />, roles: ["admin", "hr", "employee"] },
  { path: "/employee/payroll/payslips", element: <MyPayslips />, roles: ["admin", "hr", "employee"] },
  { path: "/employee/profile", element: <MyProfile />, roles: ["admin", "hr", "employee"] },

  // Common Shared Features
  { path: "/assistant", element: <AIAssistant /> },
  { path: "/announcements", element: <Announcements /> },
  { path: "/notifications", element: <Notifications /> },

  // Backward Compatible Aliases
  { path: "/organization/company-settings", element: <CompanySettings />, roles: ["admin"] },
  { path: "/organization/departments", element: <Departments />, roles: ["admin"] },
  { path: "/organization/designations", element: <Designations />, roles: ["admin"] },
  { path: "/organization/leave-types", element: <LeaveTypes />, roles: ["admin"] },
  { path: "/organization/holidays", element: <Holidays />, roles: ["admin"] },
  { path: "/organization/users", element: <UserManagement />, roles: ["admin"] },
  { path: "/employees", element: <EmployeeDirectory />, roles: ["admin", "hr"] },
  { path: "/employees/add", element: <RegisterEmployee />, roles: ["admin", "hr"] },
  { path: "/employees/:id/edit", element: <EditEmployee />, roles: ["admin", "hr"] },
  { path: "/employees/:id", element: <EmployeeProfile />, roles: ["admin", "hr"] },
  { path: "/employees/import-export", element: <EmployeeImportExport />, roles: ["admin", "hr"] },
  { path: "/attendance", element: <AttendanceBoard />, roles: ["admin", "hr"] },
  { path: "/attendance/calendar", element: <AttendanceCalendar />, roles: ["admin", "hr", "employee"] },
  { path: "/attendance/daily", element: <AttendanceBoard />, roles: ["admin", "hr"] },
  { path: "/attendance/check-in-out", element: <CheckInOut />, roles: ["admin", "hr", "employee"] },
  { path: "/attendance/corrections", element: <AttendanceCorrections />, roles: ["admin", "hr"] },
  { path: "/leave", element: <LeaveApprovals />, roles: ["admin", "hr"] },
  { path: "/leave/apply", element: <ApplyLeave />, roles: ["admin", "hr", "employee"] },
  { path: "/leave/my-requests", element: <MyLeaveRequests />, roles: ["admin", "hr", "employee"] },
  { path: "/leave/approvals", element: <LeaveApprovals />, roles: ["admin", "hr"] },
  { path: "/leave/balance", element: <LeaveBalance />, roles: ["admin", "hr", "employee"] },
  { path: "/payroll", element: <PayrollDraft />, roles: ["admin", "hr"] },
  { path: "/payroll/monthly", element: <PayrollDraft />, roles: ["admin", "hr"] },
  { path: "/payroll/payslips", element: <MyPayslips />, roles: ["admin", "hr", "employee"] },
  { path: "/analytics/admin", element: <AdminDashboard />, roles: ["admin"] },
  { path: "/analytics/hr", element: <HRDashboard />, roles: ["admin", "hr"] },
  { path: "/analytics/employee", element: <EmployeeDashboard />, roles: ["admin", "hr", "employee"] },
  { path: "/audit-log", element: <AuditLogViewer />, roles: ["admin"] },
];

export const routeConfig = [...publicRoutes, ...protectedRoutes];
