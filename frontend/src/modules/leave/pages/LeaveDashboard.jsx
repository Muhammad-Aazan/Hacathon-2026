import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../../services/api";
import toast from "react-hot-toast";
import { Calendar, Plus, CheckCircle2, XCircle, Clock, Check, X } from "lucide-react";

export default function LeaveDashboard() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["leaves-dashboard"],
    queryFn: () => api.get("/leave").then((r) => r.data),
  });

  const leaves = data?.leaves || [];
  const pendingLeaves = leaves.filter((l) => l.status === "pending");
  const approvedLeaves = leaves.filter((l) => l.status === "approved");
  const rejectedLeaves = leaves.filter((l) => l.status === "rejected");

  const statusMutation = useMutation({
    mutationFn: ({ id, status, comment }) => api.patch(`/leave/${id}/status`, { status, comment }),
    onSuccess: (_, vars) => {
      toast.success(`Leave request ${vars.status} successfully`);
      queryClient.invalidateQueries(["leaves-dashboard"]);
      queryClient.invalidateQueries(["admin-dashboard"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update leave status");
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Leave Management</h1>
          <p className="text-xs sm:text-sm text-slate-700 font-medium mt-0.5">Review leave requests, approvals, and employee quotas</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/leave/apply" className="btn-primary">
            <Plus size={16} /> Apply for Leave
          </Link>
          <Link to="/leave/balance" className="btn-secondary">
            Quota Balances
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Pending Review</span>
            <p className="text-3xl font-black text-amber-700 mt-1">{pendingLeaves.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Approved Requests</span>
            <p className="text-3xl font-black text-emerald-700 mt-1">{approvedLeaves.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Rejected Requests</span>
            <p className="text-3xl font-black text-rose-700 mt-1">{rejectedLeaves.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <XCircle size={20} />
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900">Recent Leave Applications</h3>
          <span className="text-xs font-bold text-slate-600">{leaves.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-800 uppercase font-black text-[11px]">
              <tr>
                <th className="px-5 py-4">Employee</th>
                <th className="px-5 py-4">Leave Type</th>
                <th className="px-5 py-4">Duration</th>
                <th className="px-5 py-4">Reason</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-5 py-4"><div className="h-6 bg-slate-100 rounded-lg w-full" /></td>
                  </tr>
                ))
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-600">
                    <Calendar size={32} className="mx-auto mb-2 opacity-40 text-slate-600" />
                    <p className="font-extrabold text-slate-900 text-sm">No leave requests found</p>
                    <p className="text-xs text-slate-600 mt-0.5">Employees have not submitted any applications yet.</p>
                  </td>
                </tr>
              ) : (
                leaves.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-xs shrink-0">
                          {l.employeeId?.userId?.name?.[0]?.toUpperCase() || "E"}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 leading-tight text-sm">{l.employeeId?.userId?.name || "Employee"}</p>
                          <p className="text-xs text-slate-600 font-bold">{l.employeeId?.department || "General"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-black capitalize text-slate-900 text-sm">{l.leaveType}</td>
                    <td className="px-5 py-4 text-slate-800 font-bold">
                      {new Date(l.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} - {new Date(l.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-medium max-w-xs truncate">{l.reason}</td>
                    <td className="px-5 py-4">
                      <span className={l.status === 'approved' ? 'badge-approved' : l.status === 'pending' ? 'badge-pending' : 'badge-rejected'}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {l.status === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => statusMutation.mutate({ id: l._id, status: "approved" })}
                            disabled={statusMutation.isPending}
                            className="p-1.5 px-3 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors font-extrabold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            onClick={() => statusMutation.mutate({ id: l._id, status: "rejected" })}
                            disabled={statusMutation.isPending}
                            className="p-1.5 px-3 rounded-lg bg-rose-100 text-rose-800 hover:bg-rose-200 transition-colors font-extrabold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-bold italic">Resolved</span>
                      )}
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
