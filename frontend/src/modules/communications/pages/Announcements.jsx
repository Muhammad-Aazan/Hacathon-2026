import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gsap } from "gsap";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import { Bell, Plus, Trash2, AlertCircle, Megaphone, Loader2 } from "lucide-react";

export default function Announcements() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    priority: "normal",
    targetRole: "all",
  });
  const listRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => api.get("/announcements").then((r) => r.data),
  });

  const announcements = data?.announcements || [];

  const createMutation = useMutation({
    mutationFn: (newAnn) => api.post("/announcements", newAnn),
    onSuccess: () => {
      toast.success("Announcement published! 📢");
      setShowModal(false);
      setForm({ title: "", content: "", priority: "normal", targetRole: "all" });
      queryClient.invalidateQueries(["announcements"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to post");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/announcements/${id}`),
    onSuccess: () => {
      toast.success("Announcement removed");
      queryClient.invalidateQueries(["announcements"]);
    },
  });

  useEffect(() => {
    if (announcements.length > 0 && listRef.current) {
      const items = listRef.current.querySelectorAll(".ann-card");
      gsap.fromTo(items, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: "power2.out" });
    }
  }, [announcements]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      toast.error("Please fill title and content");
      return;
    }
    createMutation.mutate({ ...form, authorName: user?.name || "HR Department" });
  };

  const priorityStyles = {
    urgent: "bg-rose-100 text-rose-700 border-rose-200",
    high: "bg-amber-100 text-amber-700 border-amber-200",
    normal: "bg-indigo-100 text-indigo-700 border-indigo-200",
    low: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Company Announcements</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Official organizational notices, town hall updates, and alerts</p>
        </div>
        {(user?.role === "admin" || user?.role === "hr") && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={16} /> Post Notice
          </button>
        )}
      </div>

      <div ref={listRef} className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200/80 shadow-xs text-center text-slate-400">
            <Megaphone size={40} className="mx-auto mb-2 opacity-30" />
            <p className="font-semibold text-slate-700">No announcements yet</p>
            <p className="text-xs text-slate-400 mt-0.5">Important organization bulletins will appear here.</p>
          </div>
        ) : (
          announcements.map((a) => (
            <div
              key={a._id}
              className="ann-card bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${priorityStyles[a.priority] || priorityStyles.normal}`}>
                    {a.priority}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(a.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                {(user?.role === "admin" || user?.role === "hr") && (
                  <button
                    onClick={() => deleteMutation.mutate(a._id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900">{a.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">{a.content}</p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>Posted by {a.authorName || "Management"}</span>
                <span className="capitalize">Audience: {a.targetRole}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for creating announcement */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-xl border border-slate-100 space-y-4">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Create Announcement</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Company Townhall Meeting"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="input-field bg-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={form.targetRole}
                    onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                    className="input-field bg-white"
                  >
                    <option value="all">Everyone</option>
                    <option value="employee">Employees Only</option>
                    <option value="hr">HR Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Body *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type the announcement details here..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="input-field resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={createMutation.isPending} className="btn-primary">
                  {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "Publish Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
