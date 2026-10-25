import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import api from "../../../services/api";
import { Users, Clock, Calendar, DollarSign, AlertCircle, CheckCircle, ArrowUpRight, Plus, UserCheck } from "lucide-react";

const COLORS = ["#4f46e5", "#059669", "#d97706", "#db2777", "#7c3aed"];

function StatCard({ title, value, icon: Icon, color, bgLight, trend }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{title}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} ${bgLight}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value ?? 0}</p>
        {trend && (
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => api.get("/analytics/admin-dashboard").then((r) => r.data),
  });

  const { data: trendData } = useQuery({
    queryKey: ["attendance-trend"],
    queryFn: () => api.get("/analytics/attendance-trend").then((r) => r.data),
  });

  const { data: deptData } = useQuery({
    queryKey: ["headcount-by-dept"],
    queryFn: () => api.get("/analytics/headcount-by-dept").then((r) => r.data),
  });

  const kpis = stats?.kpis || {};
  const trend = trendData?.trend || [];
  const depts = deptData?.departments || [];

  return (
    <div className="space-y-6">
      {/* Header - High Contrast */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Organization Overview</h1>
          <p className="text-xs sm:text-sm text-slate-700 font-medium mt-0.5">
            Real-time metrics across attendance, personnel, and operations
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/employees/add" className="btn-primary">
            <Plus size={16} /> Add Employee
          </Link>
          <Link to="/attendance/check-in-out" className="btn-secondary">
            <UserCheck size={16} /> Time Clock
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Workforce"
          value={kpis.headcount}
          icon={Users}
          color="text-indigo-700"
          bgLight="bg-indigo-100"
          trend="Active"
        />
        <StatCard
          title="Present Today"
          value={kpis.presentToday}
          icon={CheckCircle}
          color="text-emerald-700"
          bgLight="bg-emerald-100"
          trend="Checked In"
        />
        <StatCard
          title="On Leave Today"
          value={kpis.onLeave}
          icon={Calendar}
          color="text-amber-700"
          bgLight="bg-amber-100"
        />
        <StatCard
          title="Pending Approvals"
          value={kpis.pendingApprovals}
          icon={AlertCircle}
          color="text-rose-700"
          bgLight="bg-rose-100"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">Attendance Volume (Last 7 Days)</h3>
              <p className="text-xs text-slate-600 font-medium">Total present staff per workday</p>
            </div>
            <Link to="/attendance" className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1">
              View Log <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#1e293b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#1e293b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', color: '#0f172a', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="presentCount" stroke="#4f46e5" strokeWidth={3} fill="url(#colorPresent)" name="Present Employees" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Headcount by Dept Pie Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">Department Distribution</h3>
            <p className="text-xs text-slate-600 font-medium mb-4">Headcount breakdown by functional area</p>
          </div>
          <div className="h-56 w-full">
            {depts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={depts}
                    dataKey="count"
                    nameKey="department"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {depts.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs font-bold text-slate-500">
                No departmental records yet
              </div>
            )}
          </div>
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700 font-semibold">
            <span>Departments: {depts.length}</span>
            <Link to="/organization/departments" className="text-indigo-700 font-bold hover:underline">Manage</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
