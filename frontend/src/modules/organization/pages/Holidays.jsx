import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../services/api";
import toast from "react-hot-toast";
import { Calendar, Plus, Trash2, Loader2 } from "lucide-react";

export default function Holidays() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", date: "", type: "public", description: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["holidays"],
    queryFn: () => api.get("/setup/holidays").then((r) => r.data),
  });

  const holidays = data?.holidays || [];

  const addMutation = useMutation({
    mutationFn: (newHol) => api.post("/setup/holidays", newHol),
    onSuccess: () => {
      toast.success("Holiday added! 🌴");
      setShowModal(false);
      setForm({ name: "", date: "", type: "public", description: "" });
      queryClient.invalidateQueries(["holidays"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to add"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/setup/holidays/${id}`),
    onSuccess: () => {
      toast.success("Holiday removed");
      queryClient.invalidateQueries(["holidays"]);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.date) return;
    addMutation.mutate(form);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Public & Company Holidays</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Annual scheduled holidays and non-working organizational days</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} /> Add Holiday
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
            <tr>
              <th className="px-5 py-3.5">Holiday Name</th>
              <th className="px-5 py-3.5">Date</th>
              <th className="px-5 py-3.5">Category</th>
              <th className="px-5 py-3.5">Notes</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading holidays...</td></tr>
            ) : holidays.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-slate-400">
                  <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="font-semibold text-slate-700">No holidays scheduled</p>
                </td>
              </tr>
            ) : (
              holidays.map((h) => (
                <tr key={h._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{h.name}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-700">{new Date(h.date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td className="px-5 py-3.5"><span className="badge-active capitalize">{h.type}</span></td>
                  <td className="px-5 py-3.5 text-slate-500">{h.description || "—"}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => deleteMutation.mutate(h._id)} className="text-slate-400 hover:text-rose-600 p-1">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-xl border border-slate-100 space-y-4">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Add Holiday</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Holiday Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Independence Day"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={addMutation.isPending} className="btn-primary">
                  {addMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
