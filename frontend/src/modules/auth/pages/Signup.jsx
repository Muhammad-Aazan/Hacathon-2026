import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { gsap } from "gsap";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import toast from "react-hot-toast";
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, Shield } from "lucide-react";

export default function Signup() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const logoRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
  });
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
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/register", form);
      const { token, user: userData } = res.data;
      login(userData, token);
      toast.success(`Account registered! Welcome to HCM Lite, ${userData.name}! 🎉`);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h1>
        <p className="text-xs text-slate-500 mt-0.5">Join the HCM Lite organizational workspace</p>
      </div>

      {/* Card */}
      <div ref={cardRef} className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Full Name *</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. Ali Ahmed"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Email Address *</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="ali@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Password *</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPass ? "text" : "password"}
                required
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">System Role</label>
            <div className="relative">
              <Shield size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              >
                <option value="employee">Employee / Staff</option>
                <option value="hr">HR Representative</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white py-3 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-indigo-200"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Registering...</> : <>Create Account <ArrowRight size={16} /></>}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
