import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { Calendar, ArrowLeft, Plus, CheckCircle2 } from "lucide-react";

export default function LeaveBalance() {
  const { user } = useAuth();
  const cardsRef = useRef(null);

  const { data: empData } = useQuery({
    queryKey: ["current-employee", user?.id],
    queryFn: () => api.get(`/employees/user/${user?.id}`).then((r) => r.data).catch(() => null),
    enabled: !!user?.id,
  });

  const employeeId = empData?.employee?._id;

  const { data: balanceData, isLoading } = useQuery({
    queryKey: ["leave-balance", employeeId],
    queryFn: () => api.get(`/leave/balance/${employeeId}`).then((r) => r.data),
    enabled: !!employeeId,
  });

  const balance = balanceData?.balance || {
    annual: { total: 14, used: 0, remaining: 14 },
    sick: { total: 8, used: 0, remaining: 8 },
    casual: { total: 10, used: 0, remaining: 10 },
  };

  useEffect(() => {
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll(".balance-card");
      gsap.fromTo(cards, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "power2.out" });
    }
  }, [balanceData]);

  const items = [
    { title: "Annual Leave", quota: balance.annual, color: "text-indigo-600", bar: "bg-indigo-600" },
    { title: "Sick / Medical Leave", quota: balance.sick, color: "text-emerald-600", bar: "bg-emerald-600" },
    { title: "Casual Leave", quota: balance.casual, color: "text-amber-600", bar: "bg-amber-600" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/leave" className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Leave Balance & Quotas</h1>
            <p className="text-xs text-slate-500">Authorized annual leave entitlement and consumption</p>
          </div>
        </div>
        <Link to="/leave/apply" className="btn-primary">
          <Plus size={16} /> Apply Leave
        </Link>
      </div>

      <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => {
          const total = item.quota?.total || 1;
          const used = item.quota?.used || 0;
          const remaining = item.quota?.remaining || 0;
          const pct = Math.min(100, Math.round((used / total) * 100));

          return (
            <div key={item.title} className="balance-card bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.title}</span>
              <div>
                <span className={`text-4xl font-black ${item.color}`}>{remaining}</span>
                <span className="text-xs text-slate-400 font-semibold ml-1.5">days remaining</span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className={`h-full ${item.bar} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                  <span>Used: {used} days</span>
                  <span>Total: {total} days</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
