import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../../services/api";
import toast from "react-hot-toast";
import { ArrowLeft, Check, X, Calendar } from "lucide-react";

export default function LeaveApprovals() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["pending-leaves"],
    queryFn: () => api.get("/leave?status=pending").then((r) => r.data),
  });

  const leaves = data?.leaves || [];

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/leave/${id}/status`, { status }),
    onSuccess: (_, vars) => {
      toast.success(`Request marked as ${vars.status}`);
      queryClient.invalidateQueries(["pending-leaves"]);
      queryClient.invalidateQueries(["leaves-dashboard"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/leave" className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pending Leave Approvals</h1>
          <p className="text-xs text-slate-500">Authorize or decline employee absence requests</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
            <tr>
              <th className="px-5 py-3.5">Employee</th>
              <th className="px-5 py-3.5">Category</th>
              <th className="px-5 py-3.5">Date Span</th>
              <th className="px-5 py-3.5">Reason</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading requests...</td></tr>
            ) : leaves.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-slate-400">
                  <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="font-semibold text-slate-600">All caught up!</p>
                  <p className="text-xs text-slate-400 mt-0.5">No pending leave applications requiring approval.</p>
                </td>
              </tr>
            ) : (
              leaves.map((l) => (
                <tr key={l._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-900">
                    <p className="font-bold text-slate-900">{l.employeeId?.userId?.name || "Employee"}</p>
                    <p className="text-[11px] text-slate-400">{l.employeeId?.department}</p>
                  </td>
                  <td className="px-5 py-3.5 font-semibold capitalize text-slate-800">{l.leaveType}</td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 max-w-xs">{l.reason}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => statusMutation.mutate({ id: l._id, status: "approved" })}
                        disabled={statusMutation.isPending}
                        className="btn-primary py-1 px-3 text-xs"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        onClick={() => statusMutation.mutate({ id: l._id, status: "rejected" })}
                        disabled={statusMutation.isPending}
                        className="btn-danger py-1 px-3 text-xs"
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
