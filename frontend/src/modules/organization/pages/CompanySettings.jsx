import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../services/api";
import toast from "react-hot-toast";
import { Building2, Clock, Check, Loader2 } from "lucide-react";

export default function CompanySettings() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    companyName: "",
    officeStartTime: "09:00",
    graceTimeMinutes: 15,
    halfDayThresholdHours: 5,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["company-settings"],
    queryFn: () => api.get("/setup/settings").then((r) => r.data),
  });

  useEffect(() => {
    if (data?.settings) {
      setForm({
        companyName: data.settings.companyName || "",
        officeStartTime: data.settings.officeStartTime || "09:00",
        graceTimeMinutes: data.settings.graceTimeMinutes || 15,
        halfDayThresholdHours: data.settings.halfDayThresholdHours || 5,
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (newSettings) => api.post("/setup/settings", newSettings),
    onSuccess: () => {
      toast.success("Organization settings updated! ⚙️");
      queryClient.invalidateQueries(["company-settings"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update settings");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Organization Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Configure working shifts, late arrival thresholds, and general company information</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Company Legal Name</label>
          <input
            type="text"
            required
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            className="input-field"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Shift Start Time</label>
            <input
              type="time"
              required
              value={form.officeStartTime}
              onChange={(e) => setForm({ ...form, officeStartTime: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Grace Period (Minutes)</label>
            <input
              type="number"
              min="0"
              required
              value={form.graceTimeMinutes}
              onChange={(e) => setForm({ ...form, graceTimeMinutes: Number(e.target.value) })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Half Day Hours</label>
            <input
              type="number"
              min="1"
              max="12"
              required
              value={form.halfDayThresholdHours}
              onChange={(e) => setForm({ ...form, halfDayThresholdHours: Number(e.target.value) })}
              className="input-field"
            />
          </div>
        </div>

        <div className="pt-3 flex justify-end">
          <button type="submit" disabled={updateMutation.isPending} className="btn-primary">
            {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Save Settings</>}
          </button>
        </div>
      </form>
    </div>
  );
}
