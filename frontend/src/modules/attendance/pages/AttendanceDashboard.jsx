import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import api from "../../../services/api";
import { Clock, Calendar, CheckCircle2, AlertTriangle, UserCheck, Plus, Filter } from "lucide-react";

export default function AttendanceDashboard() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const tableRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ["attendance-records", selectedDate],
    queryFn: () => api.get(`/attendance?date=${selectedDate}`).then((r) => r.data),
  });

  const records = data?.records || [];

  const presentCount = records.filter((r) => r.status === "present" || r.status === "half_day").length;
  const lateCount = records.filter((r) => r.status === "late").length;
  const halfDayCount = records.filter((r) => r.status === "half_day").length;

  useEffect(() => {
    if (records.length > 0 && tableRef.current) {
      const rows = tableRef.current.querySelectorAll("tr.att-row");
      gsap.fromTo(rows, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.03, ease: "power2.out" });
    }
  }, [records]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Attendance Logs</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Monitor employee daily punctuality, work hours, and shifts</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/attendance/check-in-out" className="btn-primary">
            <UserCheck size={16} /> Open Terminal
          </Link>
          <Link to="/attendance/corrections" className="btn-secondary">
            Corrections
          </Link>
        </div>
      </div>

      {/* Date & Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Selector Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Log Date</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-2 py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Present Count</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{presentCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Late Arrivals</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{lateCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Half Day Duty</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">{halfDayCount}</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table ref={tableRef} className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-5 py-3.5">Employee ID</th>
                <th className="px-5 py-3.5">Check In</th>
                <th className="px-5 py-3.5">Check Out</th>
                <th className="px-5 py-3.5">Work Hours</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-5 py-4"><div className="h-6 bg-slate-100 rounded-lg w-full" /></td>
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    <Clock size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-slate-600">No attendance records on this date</p>
                    <p className="text-xs text-slate-400 mt-0.5">Staff have not punched in or it is a holiday/weekend.</p>
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id} className="att-row hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {r.employeeId?.userId?.name?.[0]?.toUpperCase() || "E"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-none">{r.employeeId?.userId?.name || "Employee"}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{r.employeeId?.department || "General"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-600">{r.employeeId?.employeeId || "—"}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-medium">
                      {r.workHours ? `${r.workHours} hrs` : "In Progress"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={r.status === 'present' ? 'badge-active' : r.status === 'late' ? 'badge-probation' : 'badge-rejected'}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
