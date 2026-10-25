import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import toast from "react-hot-toast";
import { Lock, ArrowLeft, Loader2 } from "lucide-react";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/change-password", form);
      toast.success("Password changed successfully! 🔐");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/" className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Security Credentials</h1>
          <p className="text-xs text-slate-500">Update your account login password</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Current Password</label>
            <input
              type="password"
              required
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">New Password</label>
            <input
              type="password"
              required
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button type="submit" disabled={loading} className="btn-primary py-2.5 px-5">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Updating...</> : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
