import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import { Clock, CheckCircle2, LogOut, Calendar } from "lucide-react";

export default function CheckInOut() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedEmpId, setSelectedEmpId] = useState("");

  // Live timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: empData } = useQuery({
    queryKey: ["current-employee", user?.id],
    queryFn: () => api.get(`/employees/user/${user?.id}`).then((r) => r.data).catch(() => null),
    enabled: !!user?.id,
  });

  const { data: allEmps } = useQuery({
    queryKey: ["all-employees-lite"],
    queryFn: () => api.get("/employees?limit=100").then((r) => r.data),
    enabled: user?.role === "admin" || user?.role === "hr",
  });

  // For employees: use their profile _id. For admin/hr with no selection, pass user.id (backend resolves it)
  const currentEmpId = selectedEmpId || empData?.employee?._id || user?.id;

  const today = currentTime.toISOString().split("T")[0];
  const { data: attData } = useQuery({
    queryKey: ["today-attendance", currentEmpId, today],
    queryFn: () => api.get(`/attendance?employeeId=${currentEmpId}&date=${today}`).then((r) => r.data),
    enabled: !!currentEmpId,
  });

  const todayRecord = attData?.records?.[0];

  const checkInMutation = useMutation({
    mutationFn: (empId) => api.post("/attendance/check-in", { employeeId: empId }),
    onSuccess: (res) => {
      toast.success(res.data?.message || "Checked in successfully! 🕒");
      queryClient.invalidateQueries(["today-attendance"]);
      queryClient.invalidateQueries(["admin-dashboard"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Check-in failed");
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (empId) => api.post("/attendance/check-out", { employeeId: empId }),
    onSuccess: (res) => {
      toast.success(res.data?.message || "Checked out successfully! 👋");
      queryClient.invalidateQueries(["today-attendance"]);
      queryClient.invalidateQueries(["admin-dashboard"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Check-out failed");
    },
  });

  const handleCheckIn = () => {
    if (!currentEmpId) {
      toast.error("Please select or register an employee profile first");
      return;
    }
    checkInMutation.mutate(currentEmpId);
  };

  const handleCheckOut = () => {
    if (!currentEmpId) {
      toast.error("Please select an employee profile");
      return;
    }
    checkOutMutation.mutate(currentEmpId);
  };

  const employeesList = allEmps?.employees || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Time & Attendance Terminal</h1>
        <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1">Record your daily work presence and track duty shifts</p>
      </div>

      {(user?.role === "admin" || user?.role === "hr") && employeesList.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-300 shadow-sm flex items-center justify-between gap-3 text-xs">
          <span className="font-black text-slate-900">Punch Terminal For:</span>
          <select
            value={currentEmpId || ""}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="input-field bg-slate-50 max-w-xs py-2 font-bold"
          >
            {employeesList.map((e) => (
              <option key={e._id} value={e._id}>
                {e.userId?.name} ({e.employeeId})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Interactive Clock Card - Sharp & Bold */}
      <div className="bg-white rounded-3xl p-8 border border-slate-300 shadow-md text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-900 rounded-full text-xs font-black">
          <Calendar size={14} />
          {currentTime.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
        </div>

        <div className="py-4">
          <h2 className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight font-mono">
            {currentTime.toLocaleTimeString()}
          </h2>
          <p className="text-xs text-slate-600 font-bold mt-2">Pakistan Standard Time (PKT / UTC+5)</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-around text-xs">
          <div>
            <p className="text-slate-600 font-bold">Check-In</p>
            <p className="font-black text-slate-900 text-sm mt-0.5">
              {todayRecord?.checkInTime ? new Date(todayRecord.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
            </p>
          </div>
          <div className="w-px h-8 bg-slate-300" />
          <div>
            <p className="text-slate-600 font-bold">Check-Out</p>
            <p className="font-black text-slate-900 text-sm mt-0.5">
              {todayRecord?.checkOutTime ? new Date(todayRecord.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
            </p>
          </div>
          <div className="w-px h-8 bg-slate-300" />
          <div>
            <p className="text-slate-600 font-bold">Today's Status</p>
            <p className="mt-0.5">
              {todayRecord ? (
                <span className={todayRecord.status === 'present' ? 'badge-active' : todayRecord.status === 'late' ? 'badge-probation' : 'badge-rejected'}>
                  {todayRecord.status}
                </span>
              ) : (
                <span className="text-slate-600 font-bold">Not Clocked</span>
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <button
            onClick={handleCheckIn}
            disabled={checkInMutation.isPending || !!todayRecord?.checkInTime}
            className={`py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
              todayRecord?.checkInTime
                ? "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none"
                : "bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white cursor-pointer"
            }`}
          >
            <CheckCircle2 size={18} />
            {todayRecord?.checkInTime ? "Checked In Already" : "Clock In"}
          </button>

          <button
            onClick={handleCheckOut}
            disabled={checkOutMutation.isPending || !todayRecord?.checkInTime || !!todayRecord?.checkOutTime}
            className={`py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
              !todayRecord?.checkInTime || todayRecord?.checkOutTime
                ? "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none"
                : "bg-rose-600 hover:bg-rose-700 active:scale-95 text-white cursor-pointer"
            }`}
          >
            <LogOut size={18} />
            {todayRecord?.checkOutTime ? "Checked Out Already" : "Clock Out"}
          </button>
        </div>

        <p className="text-xs text-slate-600 font-semibold">
          Shift start: 09:00 AM. 15 minutes grace window. Late status applied after 09:15 AM.
        </p>
      </div>
    </div>
  );
}
