import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../../services/api";
import toast from "react-hot-toast";
import { Bell, CheckCheck, Clock, Calendar, DollarSign, Megaphone, Check } from "lucide-react";

export default function Notifications() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get("/notifications").then((r) => r.data),
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const markAllMutation = useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSuccess: () => {
      toast.success("All notifications marked as read");
      queryClient.invalidateQueries(["notifications"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update notifications"),
  });

  const markSingleMutation = useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case "leave":
        return <Calendar size={18} className="text-indigo-600" />;
      case "payroll":
        return <DollarSign size={18} className="text-emerald-600" />;
      case "announcement":
        return <Megaphone size={18} className="text-purple-600" />;
      default:
        return <Bell size={18} className="text-amber-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 font-black text-xs rounded-lg uppercase tracking-wider">
              In-App Alerts
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-rose-500 text-white font-black text-xs rounded-full">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-2">
            System Notifications
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1">
            Real-time updates regarding leave decisions, attendance alerts, and payroll releases.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto"
          >
            <CheckCheck size={16} />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 font-medium">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 font-medium space-y-2">
            <Bell size={36} className="mx-auto text-slate-300" />
            <p className="text-slate-700 font-bold">You are all caught up!</p>
            <p className="text-xs text-slate-400">No new notifications at this time.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 rounded-2xl border transition-all duration-150 flex items-start gap-4 ${
                n.read
                  ? "bg-white border-slate-200"
                  : "bg-indigo-50/50 border-indigo-200 shadow-xs"
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0 mt-0.5">
                {getTypeIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-black text-slate-900 truncate">
                    {n.title}
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium mt-1">
                  {n.message}
                </p>

                <div className="flex items-center gap-3 mt-3">
                  {n.link && (
                    <Link
                      to={n.link}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline"
                    >
                      View Details &rarr;
                    </Link>
                  )}

                  {!n.read && (
                    <button
                      onClick={() => markSingleMutation.mutate(n._id)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      <Check size={13} /> Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
