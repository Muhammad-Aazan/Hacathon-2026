import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import toast from "react-hot-toast";
import {
  DollarSign, Play, Lock, CheckCircle2, FileText,
  ShieldAlert, Printer, X, Info, Download
} from "lucide-react";

export default function PayrollDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["payroll-month", selectedMonth],
    queryFn: () => api.get(`/payroll/${selectedMonth}`).then((r) => r.data),
  });

  const payrolls = data?.payrolls || [];
  const summary = data?.summary || { totalCost: 0, count: 0, isAllFinalized: false };

  const runMutation = useMutation({
    mutationFn: () => api.post("/payroll/run", { month: selectedMonth }),
    onSuccess: (res) => {
      toast.success(res.data?.message || `Payroll draft generated for ${selectedMonth}! 💰`);
      queryClient.invalidateQueries(["payroll-month"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to run payroll");
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: () => api.patch(`/payroll/finalize/${selectedMonth}`),
    onSuccess: (res) => {
      toast.success(res.data?.message || `Payroll for ${selectedMonth} locked and finalized! 🔒`);
      queryClient.invalidateQueries(["payroll-month"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to finalize payroll");
    },
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 font-black text-xs rounded-lg uppercase tracking-wider">
              {user?.role === "admin" ? "Admin Finalization Portal" : "HR Payroll Operations"}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Monthly Payroll Processing & Payslips
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
            Calculate gross salaries, deductions, progressive tax slabs, and disburse official payslips.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => runMutation.mutate()}
            disabled={runMutation.isPending || summary.isAllFinalized}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
          >
            <Play size={16} /> Run Payroll Draft
          </button>

          {user?.role === "admin" ? (
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to Finalize and Lock payroll for ${selectedMonth}? Once finalized, no further edits are permitted.`)) {
                  finalizeMutation.mutate();
                }
              }}
              disabled={finalizeMutation.isPending || payrolls.length === 0 || summary.isAllFinalized}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
            >
              <Lock size={16} /> Finalize & Lock
            </button>
          ) : (
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-xl flex items-center gap-1.5 border border-slate-200">
              <ShieldAlert size={14} className="text-amber-600" /> Admin Only Finalization
            </span>
          )}
        </div>
      </div>

      {/* Guidance Card: How Payroll & Finalize Works */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-slate-700">
        <Info size={18} className="text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-900">How Payroll Works in HCM Lite (PDF Rules):</p>
          <p>
            1. <strong>Run Payroll Draft:</strong> Gathers all active employees, calculates basic + HRA (40%) + Medical (10%), subtracts attendance absences, and applies progressive annual tax slabs.
          </p>
          <p>
            2. <strong>View Payslip:</strong> Click &ldquo;View / Print Payslip&rdquo; on any employee to inspect the detailed salary breakdown and print the official payslip.
          </p>
          <p>
            3. <strong>Finalize &amp; Lock (Admin Exclusive):</strong> Officially finalizes the month. Once finalized, payroll records are locked against tampering and published to employees&apos; &ldquo;My Payslips&rdquo; portal.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Payroll Month</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="mt-1 py-1 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-black text-slate-900 block"
            />
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Total Net Disbursement</span>
            <p className="text-2xl font-black text-slate-900 mt-1">PKR {summary.totalCost.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Status & Lock</span>
            <p className="mt-1">
              <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                summary.isAllFinalized ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}>
                {summary.isAllFinalized ? "Finalized & Locked 🔒" : "Draft In Progress ⏳"}
              </span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold shrink-0">
            <Lock size={20} />
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[11px]">
              <tr>
                <th className="px-5 py-4">Employee</th>
                <th className="px-5 py-4">Basic Salary</th>
                <th className="px-5 py-4">Gross Total</th>
                <th className="px-5 py-4">Deductions</th>
                <th className="px-5 py-4">Tax (Progressive)</th>
                <th className="px-5 py-4">Net Payout</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                    Loading payroll records...
                  </td>
                </tr>
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-500">
                    <FileText size={32} className="mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-extrabold text-slate-900 text-sm">No payroll calculated for {selectedMonth}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Click &ldquo;Run Payroll Draft&rdquo; above to compute monthly compensation.</p>
                  </td>
                </tr>
              ) : (
                payrolls.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-xs shrink-0">
                          {p.employeeId?.userId?.name?.[0]?.toUpperCase() || "E"}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 leading-none text-sm">{p.employeeId?.userId?.name || "Employee"}</p>
                          <p className="text-xs text-slate-500 font-bold mt-0.5">{p.employeeId?.employeeId} · {p.employeeId?.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-800 font-bold">PKR {p.basicSalary?.toLocaleString()}</td>
                    <td className="px-5 py-4 text-slate-800 font-bold">PKR {p.grossSalary?.toLocaleString()}</td>
                    <td className="px-5 py-4 text-rose-600 font-bold">
                      {p.deductions > 0 ? `- PKR ${p.deductions?.toLocaleString()}` : "PKR 0"}
                    </td>
                    <td className="px-5 py-4 text-rose-700 font-black">
                      {p.tax > 0 ? `- PKR ${p.tax?.toLocaleString()}` : "0% (PKR 0)"}
                    </td>
                    <td className="px-5 py-4 text-emerald-700 font-black text-sm">PKR {p.netSalary?.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                        p.status === "finalized" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => setSelectedPayslip(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors"
                      >
                        <Printer size={14} /> View Payslip
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Printable Payslip Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 print:p-0 print:border-none print:shadow-none">
            {/* Modal Actions (Hidden in Print) */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
              <span className="text-xs font-black uppercase text-indigo-600 tracking-wider">
                Official Monthly Payslip Document
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  <Download size={14} /> Print / Save as PDF
                </button>
                <button
                  onClick={() => setSelectedPayslip(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Payslip Body */}
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="HCM Lite" className="w-12 h-12 object-contain" />
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">HCM Lite Technologies</h2>
                    <p className="text-xs text-slate-500 font-medium">Monthly Confidential Salary Slip</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500 uppercase">Pay Period</span>
                  <p className="text-base font-black text-indigo-700">{selectedPayslip.month}</p>
                </div>
              </div>

              {/* Employee Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Employee Name</span>
                  <p className="font-black text-slate-900 mt-0.5">{selectedPayslip.employeeId?.userId?.name || "Employee"}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Employee Code</span>
                  <p className="font-mono font-black text-slate-900 mt-0.5">{selectedPayslip.employeeId?.employeeId}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Department</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedPayslip.employeeId?.department}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Designation</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedPayslip.employeeId?.designation}</p>
                </div>
              </div>

              {/* Attendance & Working Days Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="border border-slate-200 p-2.5 rounded-xl text-center">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Working Days</span>
                  <p className="font-black text-slate-900 mt-0.5">{selectedPayslip.workingDays || 22} Days</p>
                </div>
                <div className="border border-slate-200 p-2.5 rounded-xl text-center">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Absences</span>
                  <p className="font-black text-rose-600 mt-0.5">{selectedPayslip.absentDays || 0} Days</p>
                </div>
                <div className="border border-slate-200 p-2.5 rounded-xl text-center">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Unpaid Leaves</span>
                  <p className="font-black text-amber-600 mt-0.5">{selectedPayslip.unpaidLeaveDays || 0} Days</p>
                </div>
                <div className="border border-slate-200 p-2.5 rounded-xl text-center">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Half Days</span>
                  <p className="font-black text-indigo-600 mt-0.5">{selectedPayslip.halfDays || 0} Days</p>
                </div>
              </div>

              {/* Salary Breakdown Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Earnings */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2 font-black text-xs text-slate-800 uppercase">
                    Earnings (PKR)
                  </div>
                  <div className="p-3 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Basic Salary:</span>
                      <span className="font-bold text-slate-900">PKR {selectedPayslip.basicSalary?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">House Rent Allowance (40%):</span>
                      <span className="font-bold text-slate-900">PKR {Math.round(selectedPayslip.basicSalary * 0.40).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Medical Allowance (10%):</span>
                      <span className="font-bold text-slate-900">PKR {Math.round(selectedPayslip.basicSalary * 0.10).toLocaleString()}</span>
                    </div>
                    {selectedPayslip.allowances > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Other Allowances:</span>
                        <span className="font-bold text-slate-900">PKR {selectedPayslip.allowances?.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900">
                      <span>Total Gross Salary:</span>
                      <span>PKR {selectedPayslip.grossSalary?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2 font-black text-xs text-slate-800 uppercase">
                    Deductions (PKR)
                  </div>
                  <div className="p-3 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Absence &amp; Unpaid Leave:</span>
                      <span className="font-bold text-rose-600">PKR {selectedPayslip.deductions?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Income Tax (Progressive):</span>
                      <span className="font-bold text-rose-600">PKR {selectedPayslip.tax?.toLocaleString()}</span>
                    </div>
                    <div className="pt-8 border-t border-slate-200 flex justify-between font-black text-rose-700">
                      <span>Total Deductions:</span>
                      <span>PKR {((selectedPayslip.deductions || 0) + (selectedPayslip.tax || 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Payout Banner */}
              <div className="bg-emerald-50 border-2 border-emerald-500/40 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase text-emerald-800 tracking-wider">Net Payable Amount</span>
                  <p className="text-2xl font-black text-emerald-950 mt-0.5">
                    PKR {selectedPayslip.netSalary?.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Disbursement Status</span>
                  <p className="text-sm font-black text-emerald-800 capitalize">
                    {selectedPayslip.status}
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-6 grid grid-cols-2 gap-8 text-xs text-center border-t border-slate-200 text-slate-500">
                <div>
                  <div className="border-b border-slate-400 w-36 mx-auto mb-1 h-8" />
                  <p className="font-bold text-slate-700">HR Department</p>
                  <p className="text-[10px]">Prepared By</p>
                </div>
                <div>
                  <div className="border-b border-slate-400 w-36 mx-auto mb-1 h-8" />
                  <p className="font-bold text-slate-700">Director / Admin</p>
                  <p className="text-[10px]">Authorized Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
