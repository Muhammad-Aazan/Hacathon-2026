import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { gsap } from "gsap";
import api from "../../../services/api";
import toast from "react-hot-toast";
import { User, Clock, Check, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

export default function FirstRunSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const [form, setForm] = useState({
    adminName: "System Admin",
    adminEmail: "admin@hcm.com",
    adminPassword: "Admin123!",
    companyName: "HCM Lite Technologies",
    officeStartTime: "09:00",
    graceTimeMinutes: 15,
    departmentName: "Engineering",
    designations: "Software Engineer, Team Lead, Product Manager",
  });

  useEffect(() => {
    gsap.fromTo(containerRef.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" });
  }, [step]);

  const handleFinish = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create Admin
      await api.post("/auth/register", {
        name: form.adminName,
        email: form.adminEmail,
        password: form.adminPassword,
        role: "admin",
      });

      // 2. Save Settings
      await api.post("/setup/settings", {
        companyName: form.companyName,
        officeStartTime: form.officeStartTime,
        graceTimeMinutes: Number(form.graceTimeMinutes),
        weekends: ["Saturday", "Sunday"],
        officeLocation: { latitude: 24.8607, longitude: 67.0011, radiusMeters: 150 },
      });

      // 3. Create First Department
      const desigs = form.designations.split(",").map((d) => d.trim()).filter(Boolean);
      await api.post("/setup/departments", {
        name: form.departmentName,
        designations: desigs,
      });

      toast.success("HCM Lite initialization complete! Sign in with your admin credentials. 🎉");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Setup failed. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center mb-3">
          <img
            src="/logo.png"
            alt="HCM Lite Logo"
            className="w-16 h-16 object-contain rounded-2xl shadow-lg shadow-indigo-100 bg-white p-1 border border-slate-200/70"
          />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">HCM Lite Initial Setup</h1>
        <p className="text-xs text-slate-500 mt-0.5">Configure your organization workspace in 3 quick steps</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-100">
          {[
            { num: 1, label: "Admin Profile" },
            { num: 2, label: "Company Policy" },
            { num: 3, label: "Department" },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                  step === s.num
                    ? "bg-indigo-600 text-white shadow-xs shadow-indigo-200"
                    : step > s.num
                    ? "bg-emerald-100 text-emerald-700 font-extrabold"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {step > s.num ? <Check size={14} /> : s.num}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${step === s.num ? "text-slate-900" : "text-slate-400"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div ref={containerRef}>
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Step 1: Create Master Admin Account</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Full Name</label>
                <input
                  type="text"
                  required
                  value={form.adminName}
                  onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Email Address</label>
                <input
                  type="email"
                  required
                  value={form.adminEmail}
                  onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Master Password</label>
                <input
                  type="password"
                  required
                  value={form.adminPassword}
                  onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="pt-4 flex justify-end">
                <button type="button" onClick={() => setStep(2)} className="btn-primary">
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Step 2: Company & Attendance Rules</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  required
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shift Start Time</label>
                  <input
                    type="time"
                    required
                    value={form.officeStartTime}
                    onChange={(e) => setForm({ ...form, officeStartTime: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Grace Period (Minutes)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.graceTimeMinutes}
                    onChange={(e) => setForm({ ...form, graceTimeMinutes: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                  <ArrowLeft size={16} /> Back
                </button>
                <button type="button" onClick={() => setStep(3)} className="btn-primary">
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleFinish} className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Step 3: First Department & Roles</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={form.departmentName}
                  onChange={(e) => setForm({ ...form, departmentName: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Designations (comma-separated)</label>
                <input
                  type="text"
                  required
                  value={form.designations}
                  onChange={(e) => setForm({ ...form, designations: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="pt-4 flex justify-between">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary">
                  <ArrowLeft size={16} /> Back
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Finalizing...</> : <><Check size={16} /> Complete Setup</>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="text-center mt-5">
        <Link to="/login" className="text-xs text-slate-500 hover:text-indigo-600 font-medium">
          Already configured? <span className="text-indigo-600 font-semibold underline">Back to Login</span>
        </Link>
      </div>
    </div>
  );
}
