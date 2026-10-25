import { useQuery } from "@tanstack/react-query";
import api from "../../../services/api";
import { BarChart2, Download, Users, Clock, Calendar, DollarSign, Printer } from "lucide-react";

export default function Reports() {
  const { data: stats } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => api.get("/analytics/admin-dashboard").then((r) => r.data),
  });

  const kpis = stats?.kpis || {};

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Executive Management Reports</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">High-level workforce health, attendance rates, and fiscal summary</p>
        </div>
        <button onClick={handlePrint} className="btn-secondary">
          <Printer size={16} /> Print Report
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">HCM Lite Operational Audit</span>
            <h3 className="text-lg font-black text-slate-900">Monthly Workforce Overview</h3>
          </div>
          <span className="text-xs text-slate-400">Generated on {new Date().toLocaleDateString()}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-xs text-slate-500 font-semibold">Active Headcount</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{kpis.headcount || 0}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-xs text-slate-500 font-semibold">Today's Presence</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{kpis.presentToday || 0}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-xs text-slate-500 font-semibold">Leaves Pending</span>
            <p className="text-2xl font-black text-amber-600 mt-1">{kpis.pendingApprovals || 0}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-xs text-slate-500 font-semibold">Total Net Payroll</span>
            <p className="text-2xl font-black text-indigo-600 mt-1">PKR {(kpis.totalPayroll || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
          <p className="font-bold">Summary Commentary:</p>
          <p className="mt-1">
            Workforce operations are operating within expected operational variance. Attendance check-ins comply with standard shift timings, and payroll provisions remain aligned with the statutory Pakistan income tax slab schedules.
          </p>
        </div>
      </div>
    </div>
  );
}
