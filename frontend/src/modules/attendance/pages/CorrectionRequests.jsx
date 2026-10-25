import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../../services/api";
import toast from "react-hot-toast";
import { ArrowLeft, Check, X, Clock } from "lucide-react";

export default function CorrectionRequests() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["attendance-corrections"],
    queryFn: () => api.get("/attendance/corrections").then((r) => r.data),
  });

  const corrections = data?.corrections || [];

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/attendance/corrections/${id}`, { status }),
    onSuccess: (_, vars) => {
      toast.success(`Correction request marked as ${vars.status}`);
      queryClient.invalidateQueries(["attendance-corrections"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update"),
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/attendance" className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Attendance Correction Requests</h1>
          <p className="text-xs text-slate-500">Approve or reject missed punch adjustments from staff</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
            <tr>
              <th className="px-5 py-3.5">Employee</th>
              <th className="px-5 py-3.5">Date</th>
              <th className="px-5 py-3.5">Requested Timing</th>
              <th className="px-5 py-3.5">Reason</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading requests...</td></tr>
            ) : corrections.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-slate-400">
                  <Clock size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="font-semibold text-slate-700">No correction requests</p>
                </td>
              </tr>
            ) : (
              corrections.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{c.employeeId?.userId?.name || "Employee"}</td>
                  <td className="px-5 py-3.5 text-slate-600 font-mono text-xs">{c.date}</td>
                  <td className="px-5 py-3.5 text-slate-700 font-medium">{c.requestedCheckIn || "09:00"} - {c.requestedCheckOut || "18:00"}</td>
                  <td className="px-5 py-3.5 text-slate-500">{c.reason}</td>
                  <td className="px-5 py-3.5">
                    <span className={c.status === "approved" ? "badge-approved" : c.status === "pending" ? "badge-pending" : "badge-rejected"}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {c.status === "pending" ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => updateMutation.mutate({ id: c._id, status: "approved" })}
                          className="btn-primary py-1 px-2.5 text-xs"
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          onClick={() => updateMutation.mutate({ id: c._id, status: "rejected" })}
                          className="btn-danger py-1 px-2.5 text-xs"
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Resolved</span>
                    )}
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
