import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { ArrowLeft, DollarSign, FileText, Download, Printer } from "lucide-react";

export default function MyPayslips() {
  const { user } = useAuth();

  const { data: empData } = useQuery({
    queryKey: ["current-employee", user?.id],
    queryFn: () => api.get(`/employees/user/${user?.id}`).then((r) => r.data).catch(() => null),
    enabled: !!user?.id,
  });

  const employeeId = empData?.employee?._id;

  const { data, isLoading } = useQuery({
    queryKey: ["my-payslips", employeeId],
    queryFn: () => api.get(`/payroll/employee/${employeeId}`).then((r) => r.data),
    enabled: !!employeeId,
  });

  const payrolls = data?.payrolls || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Salary Payslips</h1>
            <p className="text-xs text-slate-500">Official monthly earnings statements and statutory tax records</p>
          </div>
        </div>
        {payrolls.length > 0 && (
          <button onClick={handlePrint} className="btn-secondary">
            <Printer size={16} /> Print Payslip
          </button>
        )}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading payslips...</div>
        ) : payrolls.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200/80 shadow-xs text-center text-slate-400">
            <FileText size={40} className="mx-auto mb-2 opacity-30" />
            <p className="font-semibold text-slate-700">No payslips available yet</p>
            <p className="text-xs text-slate-400 mt-0.5">Your monthly payroll will appear here once finalized by HR.</p>
          </div>
        ) : (
          payrolls.map((p) => (
            <div key={p._id} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Salary Statement</span>
                  <h3 className="text-xl font-black text-slate-900">Month: {p.month}</h3>
                </div>
                <span className={p.status === "finalized" ? "badge-approved text-xs px-3 py-1" : "badge-pending text-xs px-3 py-1"}>
                  {p.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-slate-400">Basic Pay</p>
                  <p className="font-bold text-slate-900 mt-1">PKR {p.basicSalary?.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-slate-400">Gross Total</p>
                  <p className="font-bold text-slate-900 mt-1">PKR {p.grossSalary?.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-rose-50/60 rounded-xl">
                  <p className="text-rose-500 font-semibold">Tax Deduction</p>
                  <p className="font-bold text-rose-600 mt-1">- PKR {p.tax?.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-xl">
                  <p className="text-emerald-600 font-semibold">Net Disbursed</p>
                  <p className="font-black text-emerald-700 mt-1 text-sm">PKR {p.netSalary?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
