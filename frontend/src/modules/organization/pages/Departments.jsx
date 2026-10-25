import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../services/api";
import toast from "react-hot-toast";
import { Building2, Plus, Trash2, Tag, Loader2 } from "lucide-react";

export default function Departments() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    designations: "Software Engineer, QA Engineer, Project Lead",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.get("/setup/departments").then((r) => r.data),
  });

  const departments = data?.departments || [];

  const addMutation = useMutation({
    mutationFn: (newDept) => api.post("/setup/departments", newDept),
    onSuccess: () => {
      toast.success("Department created! 🏢");
      setShowModal(false);
      setForm({ name: "", designations: "" });
      queryClient.invalidateQueries(["departments"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create department"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/setup/departments/${id}`),
    onSuccess: () => {
      toast.success("Department removed");
      queryClient.invalidateQueries(["departments"]);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    const desigs = form.designations.split(",").map((d) => d.trim()).filter(Boolean);
    addMutation.mutate({ name: form.name, designations: desigs });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Departments & Roles</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Define business departments, roles, and default leave quotas</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} /> New Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-2 p-8 text-center text-slate-400">Loading departments...</div>
        ) : departments.length === 0 ? (
          <div className="col-span-2 bg-white p-12 rounded-3xl border border-slate-200/80 shadow-xs text-center text-slate-400">
            <Building2 size={36} className="mx-auto mb-2 opacity-30" />
            <p className="font-semibold text-slate-700">No departments added yet</p>
          </div>
        ) : (
          departments.map((d) => (
            <div key={d._id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Building2 size={16} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{d.name}</h3>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(d._id)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Designations</p>
                <div className="flex flex-wrap gap-1.5">
                  {d.designations?.map((des, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                      {des}
                    </span>
                  )) || <span className="text-xs text-slate-400">No designations</span>}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Annual: {d.leaveQuotas?.annual || 14}d</span>
                <span>Sick: {d.leaveQuotas?.sick || 8}d</span>
                <span>Casual: {d.leaveQuotas?.casual || 10}d</span>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-xl border border-slate-100 space-y-4">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Add Department</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operations"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Designations (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Manager, Officer, Associate"
                  value={form.designations}
                  onChange={(e) => setForm({ ...form, designations: e.target.value })}
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
