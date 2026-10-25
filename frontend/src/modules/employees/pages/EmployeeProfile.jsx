import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { gsap } from "gsap";
import api from "../../../services/api";
import { ArrowLeft, Edit2, Mail, Phone, MapPin, Briefcase, Calendar, DollarSign, Clock, ShieldCheck } from "lucide-react";

export default function EmployeeProfile() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const cardRef = useRef(null);

  const { data: empData, isLoading } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => api.get(`/employees/${id}`).then((r) => r.data),
  });

  const { data: attendanceData } = useQuery({
    queryKey: ["employee-attendance", id],
    queryFn: () => api.get(`/attendance/my/${id}`).then((r) => r.data),
    enabled: activeTab === "attendance",
  });

  const { data: leaveData } = useQuery({
    queryKey: ["employee-leaves", id],
    queryFn: () => api.get(`/leave/my/${id}`).then((r) => r.data),
    enabled: activeTab === "leaves",
  });

  const { data: payrollData } = useQuery({
    queryKey: ["employee-payroll", id],
    queryFn: () => api.get(`/payroll/employee/${id}`).then((r) => r.data),
    enabled: activeTab === "payslips",
  });

  useEffect(() => {
    if (cardRef.current) {
      gsap.from(cardRef.current, { y: 20, opacity: 0, duration: 0.45, ease: "power2.out" });
    }
  }, [id]);

  if (isLoading) {
    return <div className="p-12 text-center text-slate-400">Loading profile data...</div>;
  }

  const emp = empData?.employee;
  if (!emp) {
    return <div className="p-12 text-center text-rose-500">Employee record not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link to="/employees" className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600">
          <ArrowLeft size={16} /> Back to Directory
        </Link>
        <Link to={`/employees/${id}/edit`} className="btn-secondary">
          <Edit2 size={14} /> Edit Profile
        </Link>
      </div>

      {/* Hero Profile Card */}
      <div ref={cardRef} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            {emp.userId?.name?.[0]?.toUpperCase() || "E"}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{emp.userId?.name || "Employee"}</h1>
              <span
                className={
                  emp.status === "active"
                    ? "badge-active"
                    : emp.status === "probation"
                    ? "badge-probation"
                    : "badge-exited"
                }
              >
                {emp.status}
              </span>
            </div>
            <p className="text-sm font-semibold text-indigo-600">{emp.designation} · {emp.department}</p>
            <p className="text-xs text-slate-400 font-mono">Employee ID: {emp.employeeId}</p>
          </div>
        </div>

        {/* Quick Contact Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-indigo-500" />
            <span className="truncate">{emp.userId?.email || "No email"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-indigo-500" />
            <span>{emp.phone || "No phone registered"}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-indigo-500" />
            <span>{emp.address || "No address specified"}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs sm:text-sm font-semibold">
        {[
          { key: "overview", label: "Overview & Compensation" },
          { key: "attendance", label: "Attendance History" },
          { key: "leaves", label: "Leave Requests" },
          { key: "payslips", label: "Salary Payslips" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`pb-3 transition-colors relative ${
              activeTab === t.key ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
            {activeTab === t.key && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign size={16} className="text-indigo-600" /> Compensation Structure
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Basic Monthly:</span>
                <span className="font-semibold text-slate-900">PKR {emp.salaryStructure?.basic?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Monthly Allowances:</span>
                <span className="font-semibold text-slate-900">PKR {emp.salaryStructure?.allowances?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between py-2 bg-indigo-50/50 px-3 rounded-xl font-bold">
                <span className="text-indigo-700">Gross Monthly Salary:</span>
                <span className="text-indigo-700">PKR {emp.salaryStructure?.gross?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Briefcase size={16} className="text-indigo-600" /> Organizational Role
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">System Role:</span>
                <span className="font-semibold text-slate-900 capitalize">{emp.userId?.role || "employee"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-900">{emp.department}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Joined On:</span>
                <span className="font-semibold text-slate-900">{new Date(emp.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "attendance" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Check-In</th>
                <th className="p-4">Check-Out</th>
                <th className="p-4">Work Hours</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendanceData?.records?.length ? (
                attendanceData.records.map((r) => (
                  <tr key={r._id}>
                    <td className="p-4 font-semibold text-slate-900">{r.date}</td>
                    <td className="p-4 text-slate-600">{r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : "—"}</td>
                    <td className="p-4 text-slate-600">{r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : "—"}</td>
                    <td className="p-4 text-slate-600">{r.workHours ? `${r.workHours} hrs` : "—"}</td>
                    <td className="p-4">
                      <span className={r.status === 'present' ? 'badge-active' : r.status === 'late' ? 'badge-probation' : 'badge-rejected'}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">No recent attendance records</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "leaves" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="p-4">Type</th>
                <th className="p-4">Dates</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaveData?.leaves?.length ? (
                leaveData.leaves.map((l) => (
                  <tr key={l._id}>
                    <td className="p-4 font-semibold text-slate-900 capitalize">{l.leaveType}</td>
                    <td className="p-4 text-slate-600">{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</td>
                    <td className="p-4 text-slate-600">{l.reason}</td>
                    <td className="p-4">
                      <span className={l.status === 'approved' ? 'badge-approved' : l.status === 'pending' ? 'badge-pending' : 'badge-rejected'}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400">No leave requests found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "payslips" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="p-4">Month</th>
                <th className="p-4">Basic</th>
                <th className="p-4">Gross</th>
                <th className="p-4">Tax / Deductions</th>
                <th className="p-4">Net Salary</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payrollData?.payrolls?.length ? (
                payrollData.payrolls.map((p) => (
                  <tr key={p._id}>
                    <td className="p-4 font-bold text-slate-900">{p.month}</td>
                    <td className="p-4 text-slate-600">PKR {p.basicSalary?.toLocaleString()}</td>
                    <td className="p-4 text-slate-600">PKR {p.grossSalary?.toLocaleString()}</td>
                    <td className="p-4 text-rose-600">- PKR {p.tax?.toLocaleString()}</td>
                    <td className="p-4 font-extrabold text-emerald-600">PKR {p.netSalary?.toLocaleString()}</td>
                    <td className="p-4"><span className="badge-active">{p.status}</span></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">No payslips issued yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
