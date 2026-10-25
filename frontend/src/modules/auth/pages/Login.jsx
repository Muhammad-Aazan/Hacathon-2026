import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { gsap } from "gsap";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, UserPlus } from "lucide-react";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const logoRef = useRef(null);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/");
      return;
    }
    const ctx = gsap.context(() => {
      gsap.from(logoRef.current, { y: -30, opacity: 0, duration: 0.6, ease: "back.out(1.4)" });
      gsap.from(cardRef.current, { y: 40, opacity: 0, duration: 0.7, ease: "power3.out", delay: 0.15 });
    });
    return () => ctx.revert();
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      const { token, user: userData } = res.data;
      login(userData, token);
      toast.success(`Welcome back, ${userData.name}! 👋`);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') {
      setForm({ email: "admin@hcm.com", password: "Admin123!" });
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Brand Header with Root Logo */}
      <div ref={logoRef} className="text-center mb-6">
        <div className="inline-flex items-center justify-center mb-3">
          <img
            src="/logo.png"
            alt="HCM Lite Logo"
            className="w-16 h-16 object-contain rounded-2xl shadow-lg shadow-indigo-100 bg-white p-1 border border-slate-200/70"
          />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">HCM Lite</h1>
        <p className="text-xs text-slate-500 mt-0.5">Human Capital Management Portal</p>
      </div>

      {/* Main Card */}
      <div ref={cardRef} className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sign in to your account</h2>
          <p className="text-xs text-slate-400 mt-1">Enter your organizational credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Forgot?</Link>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white py-3 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-indigo-200"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Authenticating...</> : <>Sign In <ArrowRight size={16} /></>}
          </button>
        </form>

        {/* Quick Demo Credential Button */}
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">Quick Access</p>
          <button
            type="button"
            onClick={() => fillDemo('admin')}
            className="w-full py-2 px-3 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShieldCheck size={14} /> Fill Demo Admin (admin@hcm.com)
          </button>
        </div>

        {/* Link to Sign Up */}
        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Don't have an account yet?{" "}
            <Link to="/signup" className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-1">
              <UserPlus size={13} /> Sign Up
            </Link>
          </p>
        </div>
      </div>

      <div className="text-center mt-5">
        <Link to="/setup" className="text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors">
          Initial workspace setup? <span className="text-indigo-600 font-semibold underline">First Run Setup</span>
        </Link>
      </div>
    </div>
  );
}
