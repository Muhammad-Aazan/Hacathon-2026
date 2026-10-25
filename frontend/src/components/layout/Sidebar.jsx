import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Users, Clock, Calendar, DollarSign,
  Bot, Bell, Building2, LogOut, CheckSquare,
  FileText, Shield, X, Camera, UserPlus, FileSpreadsheet,
  CheckCircle, Settings, Layers, Lock
} from "lucide-react";

const getNavItems = (role) => {
  if (role === "admin") {
    return [
      { label: "Executive Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Company Settings", path: "/admin/settings", icon: Settings },
      { label: "Departments", path: "/admin/departments", icon: Building2 },
      { label: "Designations", path: "/admin/designations", icon: Layers },
      { label: "Holidays", path: "/admin/holidays", icon: Calendar },
      { label: "Leave Types", path: "/admin/leave-types", icon: FileText },
      { label: "HR User Access", path: "/admin/users", icon: Shield },
      { label: "Finalize Payroll", path: "/admin/payroll", icon: Lock },
      { label: "Audit Logs", path: "/admin/audit-logs", icon: FileSpreadsheet },
      { label: "Announcements", path: "/announcements", icon: Bell },
      { label: "AI Assistant", path: "/assistant", icon: Bot },
    ];
  }

  if (role === "hr") {
    return [
      { label: "HR Dashboard", path: "/hr/dashboard", icon: LayoutDashboard },
      { label: "Employee Directory", path: "/hr/employees", icon: Users },
      { label: "Register Employee", path: "/hr/employees/add", icon: UserPlus },
      { label: "CSV Import / Export", path: "/hr/employees/import-export", icon: FileSpreadsheet },
      { label: "Attendance Board", path: "/hr/attendance", icon: Clock },
      { label: "Correction Requests", path: "/hr/attendance/corrections", icon: CheckCircle },
      { label: "Leave Approvals", path: "/hr/leave/approvals", icon: Calendar },
      { label: "Payroll Drafts", path: "/hr/payroll", icon: DollarSign },
      { label: "Announcements", path: "/announcements", icon: Bell },
      { label: "AI Assistant", path: "/assistant", icon: Bot },
    ];
  }

  // Employee Role
  return [
    { label: "My Dashboard", path: "/employee/dashboard", icon: LayoutDashboard },
    { label: "Face Attendance (+10)", path: "/employee/attendance/face", icon: Camera },
    { label: "Web Check-In / Out", path: "/employee/attendance/check-in", icon: CheckSquare },
    { label: "Attendance Calendar", path: "/employee/attendance/calendar", icon: Clock },
    { label: "Apply Leave (AI Smart)", path: "/employee/leave/apply", icon: Calendar },
    { label: "My Leave Requests", path: "/employee/leave/my-requests", icon: FileText },
    { label: "Leave Balance", path: "/employee/leave/balance", icon: Layers },
    { label: "My Payslips", path: "/employee/payroll/payslips", icon: DollarSign },
    { label: "Announcements", path: "/announcements", icon: Bell },
    { label: "AI Assistant", path: "/assistant", icon: Bot },
  ];
};

export default function Sidebar({ mobileOpen = false, onClose = () => {} }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = getNavItems(user?.role);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const sidebarContent = (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shadow-xs select-none z-40">
      {/* Brand Header with Root Logo */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="HCM Lite"
            className="w-11 h-11 object-contain rounded-xl p-0.5 bg-white border border-slate-200 shadow-sm shrink-0"
          />
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight leading-none">
              HCM Lite
            </h1>
            <p className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider mt-1">
              {user?.role || "Staff"} Portal
            </p>
          </div>
        </div>

        {mobileOpen && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav List - High Contrast Solid Dark Text */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            end={item.path.endsWith("/dashboard")}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm font-black"
                  : "text-slate-800 hover:bg-indigo-50 hover:text-indigo-700"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={18}
                  className={`shrink-0 ${
                    isActive ? "text-white" : "text-slate-600 group-hover:text-indigo-600"
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-white shadow-xs shrink-0" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-2">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-slate-900 truncate">
              {user?.name || "Staff Member"}
            </p>
            <p className="text-[11px] font-semibold text-slate-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-700 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-200"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
