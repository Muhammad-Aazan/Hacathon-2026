import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../services/api";
import toast from "react-hot-toast";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      toast.success(res.data?.message || "Password recovery instructions sent to your email!");
    } catch (err) {
      toast.error(err.response?.data?.message || "No account found with this email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center mb-3">
          <img
            src="/logo.png"
            alt="HCM Lite Logo"
            className="w-16 h-16 object-contain rounded-2xl shadow-lg shadow-indigo-100 bg-white p-1 border border-slate-200/70"
          />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account Recovery</h1>
        <p className="text-xs text-slate-500 mt-0.5">Enter your registered organizational email</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary py-3">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600">
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
