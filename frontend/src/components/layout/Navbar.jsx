import { Bell, Menu, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";

const pageTitles = {
  "/": "Dashboard Overview",
  "/admin/dashboard": "Admin Executive Dashboard",
  "/admin/settings": "Company Settings & Geofence",
  "/admin/departments": "Departments & Leave Quotas",
  "/admin/designations": "Organization Designations",
  "/admin/holidays": "Public Holidays Management",
  "/admin/leave-types": "Leave Categories & Rules",
  "/admin/users": "User Access & HR Credentials",
  "/admin/payroll": "Finalize & Lock Monthly Payroll",
  "/admin/audit-logs": "Immutable System Audit Trail",
  "/hr/dashboard": "HR Operations Dashboard",
  "/hr/employees": "Employee Directory",
  "/hr/employees/add": "Register New Employee",
  "/hr/employees/import-export": "Bulk CSV Import / Export",
  "/hr/attendance": "Daily Attendance Overview",
  "/hr/attendance/corrections": "Attendance Corrections",
  "/hr/leave/approvals": "Leave Applications Approval",
  "/hr/payroll": "Monthly Payroll Drafts",
  "/employee/dashboard": "My Employee Dashboard",
  "/employee/attendance/face": "Biometric Face & GPS Attendance",
  "/employee/attendance/check-in": "Digital Web Time Clock",
  "/employee/attendance/calendar": "My Attendance Calendar",
  "/employee/leave/apply": "Apply for Leave (AI Smart)",
  "/employee/leave/my-requests": "My Submitted Leaves",
  "/employee/leave/balance": "My Remaining Leave Quotas",
  "/employee/payroll/payslips": "My Official Payslips",
  "/employee/profile": "My Personal Profile",
  "/assistant": "AI Executive Assistant",
  "/announcements": "Company Announcements",
  "/notifications": "System Notifications",
};

export default function Navbar({ onToggleSidebar = () => {} }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const title = pageTitles[pathname] || "HCM Lite";

  const { data } = useQuery({
    queryKey: ["notifications-count"],
    queryFn: () => api.get("/notifications").then((r) => r.data).catch(() => null),
    enabled: !!user,
    refetchInterval: 15000,
  });

  const unreadCount = data?.unreadCount || 0;

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-800 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        {/* Brand preview on small screens */}
        <div className="flex items-center gap-2.5 lg:hidden">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain rounded-lg shadow-xs" />
        </div>

        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight leading-tight">{title}</h2>
          <p className="text-[11px] font-bold text-slate-600 hidden sm:block">Saylani Human Capital Management</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        <Link 
          to="/assistant" 
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all border border-indigo-200"
        >
          <Sparkles size={13} className="text-indigo-600" />
          Ask AI
        </Link>

        <Link to="/notifications" className="p-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors relative" title="Notifications">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-black flex items-center justify-center ring-2 ring-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-black text-slate-900 leading-none">{user?.name || "User"}</p>
            <p className="text-[11px] text-slate-600 capitalize font-bold mt-0.5">{user?.role || "Staff"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
