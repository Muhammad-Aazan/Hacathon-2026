import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { gsap } from "gsap";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import { ArrowLeft, Sparkles, Loader2, Check, Bot } from "lucide-react";

export default function ApplyLeave() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [form, setForm] = useState({
    leaveType: "annual",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    reason: "",
  });
  const [smartPrompt, setSmartPrompt] = useState("");
  const [parsingAI, setParsingAI] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get current employee
  const { data: empData } = useQuery({
    queryKey: ["current-employee", user?.id],
    queryFn: () => api.get(`/employees/user/${user?.id}`).then((r) => r.data).catch(() => null),
    enabled: !!user?.id,
  });

  const employeeId = empData?.employee?._id;

  // Get leave balance
  const { data: balanceData } = useQuery({
    queryKey: ["leave-balance", employeeId],
    queryFn: () => api.get(`/leave/balance/${employeeId}`).then((r) => r.data),
    enabled: !!employeeId,
  });

  useEffect(() => {
    // Safe animation without opacity: 0 to prevent freeze bugs
    gsap.from(formRef.current, { y: 15, duration: 0.35, ease: "power2.out" });
  }, []);

  const balance = balanceData?.balance || {
    annual: { total: 14, used: 0, remaining: 14 },
    sick: { total: 8, used: 0, remaining: 8 },
    casual: { total: 10, used: 0, remaining: 10 },
  };

  // AI Smart Leave auto-fill
  const handleSmartLeaveParse = async () => {
    if (!smartPrompt.trim()) {
      toast.error("Please enter a sentence describing your leave request");
      return;
    }

    setParsingAI(true);
    try {
      const res = await api.post("/ai/smart-leave", { text: smartPrompt });
      if (res.data?.parsed) {
        const { leaveType, startDate, endDate, reason } = res.data.parsed;
        setForm((prev) => ({
          ...prev,
          leaveType: leaveType || prev.leaveType,
          startDate: startDate || prev.startDate,
          endDate: endDate || prev.endDate,
          reason: reason || smartPrompt,
        }));
        toast.success("AI parsed your request! Please review the dates and click Submit.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to parse leave with AI");
    } finally {
      setParsingAI(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeId) {
      toast.error("No employee profile linked. Please contact HR.");
      return;
    }
    if (!form.reason) {
      toast.error("Please provide a reason for leave");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/leave/apply", {
        ...form,
        employeeId,
      });
      toast.success(res.data?.message || "Leave application submitted! 📅");
      navigate("/employee/leave/my-requests");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit leave request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/employee/dashboard" className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Apply for Leave</h1>
          <p className="text-xs text-slate-500">Submit official leave application for HR review</p>
        </div>
      </div>

      {/* Quota balance preview pills */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Annual Leave</span>
          <p className="text-xl font-extrabold text-indigo-600 mt-1">
            {balance.annual?.remaining} <span className="text-xs text-slate-400">/ {balance.annual?.total} left</span>
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Sick Leave</span>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">
            {balance.sick?.remaining} <span className="text-xs text-slate-400">/ {balance.sick?.total} left</span>
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Casual Leave</span>
          <p className="text-xl font-extrabold text-amber-600 mt-1">
            {balance.casual?.remaining} <span className="text-xs text-slate-400">/ {balance.casual?.total} left</span>
          </p>
        </div>
      </div>

      {/* AI Smart Leave Assistant Card */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-200/80 space-y-3">
        <div className="flex items-center gap-2 text-indigo-900 font-black text-sm">
          <Bot size={18} className="text-indigo-600" />
          Smart Leave AI Assistant (Module 8)
        </div>
        <p className="text-xs text-indigo-800 font-medium">
          Type or speak naturally (e.g. &ldquo;Fever since morning need 2 days sick leave from tomorrow&rdquo;) and our AI will pre-fill the form for your review:
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your leave request in plain English or Urdu..."
            value={smartPrompt}
            onChange={(e) => setSmartPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSmartLeaveParse()}
            className="flex-1 px-3.5 py-2 bg-white border border-indigo-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
          <button
            type="button"
            onClick={handleSmartLeaveParse}
            disabled={parsingAI}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shrink-0"
          >
            {parsingAI ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            Auto-Fill
          </button>
        </div>
      </div>

      {/* Standard Form */}
      <form ref={formRef} onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Leave Category *</label>
          <select
            value={form.leaveType}
            onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="annual">Annual Leave (14 days quota)</option>
            <option value="sick">Medical / Sick Leave (8 days quota)</option>
            <option value="casual">Casual Leave (10 days quota)</option>
            <option value="unpaid">Unpaid / Extraordinary Leave</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Start Date *</label>
            <input
              type="date"
              required
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">End Date *</label>
            <input
              type="date"
              required
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Reason for Request *</label>
          <textarea
            rows={4}
            required
            placeholder="Explain briefly why you are requesting leave..."
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-xs"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Check size={16} /> Submit Application</>}
          </button>
        </div>
      </form>
    </div>
  );
}
