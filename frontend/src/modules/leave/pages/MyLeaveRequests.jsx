import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, Calendar, XCircle } from "lucide-react";

export default function MyLeaveRequests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: empData } = useQuery({
    queryKey: ["current-employee", user?.id],
    queryFn: () => api.get(`/employees/user/${user?.id}`).then((r) => r.data).catch(() => null),
    enabled: !!user?.id,
  });

  const employeeId = empData?.employee?._id;

  const { data, isLoading } = useQuery({
    queryKey: ["my-leaves", employeeId],
    queryFn: () => api.get(`/leave/my/${employeeId}`).then((r) => r.data),
    enabled: !!employeeId,
  });

  const leaves = data?.leaves || [];

  const cancelMutation = useMutation({
    mutationFn: (leaveId) => api.delete(`/leave/${leaveId}`),
    onSuccess: (res) => {
      toast.success(res.data?.message || "Leave request cancelled!");
      queryClient.invalidateQueries(["my-leaves"]);
      queryClient.invalidateQueries(["leave-balance"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to cancel leave");
    },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/employee/dashboard" className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Leave Applications</h1>
            <p className="text-xs text-slate-500">History, approvals, comments, and cancellation options</p>
          </div>
        </div>
        <Link to="/employee/leave/apply" className="btn-primary self-start sm:self-auto">
          <Plus size={16} /> Apply Leave
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Date Range</th>
                <th className="px-5 py-3.5">Reason</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">HR Comments</th>
                <th className="px-5 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading your leaves...</td></tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400">
                    <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-slate-600">No applications yet</p>
                    <p className="text-xs text-slate-400 mt-0.5">You have not submitted any leave requests.</p>
                  </td>
                </tr>
              ) : (
                leaves.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-bold capitalize text-slate-900">{l.leaveType}</td>
                    <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                      {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 max-w-xs truncate">{l.reason}</td>
                    <td className="px-5 py-3.5">
                      <span className={
                        l.status === 'approved' ? 'badge-approved' :
                        l.status === 'pending' ? 'badge-pending' :
                        l.status === 'cancelled' ? 'px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600' :
                        'badge-rejected'
                      }>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 italic text-xs">
                      {l.comment || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {l.status === 'pending' ? (
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to cancel this leave application?")) {
                              cancelMutation.mutate(l._id);
                            }
                          }}
                          disabled={cancelMutation.isPending}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                        >
                          <XCircle size={13} /> Cancel
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
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
