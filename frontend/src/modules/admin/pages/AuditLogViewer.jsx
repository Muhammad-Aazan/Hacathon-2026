import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../services/api";
import { ShieldCheck, Search, Filter, Clock, Activity } from "lucide-react";

export default function AuditLogViewer() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", search, roleFilter],
    queryFn: () => {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.actorRole = roleFilter;
      return api.get("/admin/audit-logs", { params }).then((r) => r.data);
    },
  });

  const logs = data?.data?.logs || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-purple-100 text-purple-700 font-black text-xs rounded-lg uppercase tracking-wider">
              Admin Exclusive
            </span>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg flex items-center gap-1">
              <ShieldCheck size={14} /> Immutable Audit Trail
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-2">
            System Security & Audit Logs
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1">
            Complete tamper-proof record of all critical system actions, actors, and state mutations.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by actor name or action details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin Only</option>
            <option value="hr">HR Only</option>
            <option value="employee">Employee Only</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Actor</th>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Entity</th>
                <th className="px-5 py-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                    No audit logs matching query.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-slate-400" />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      <div>{log.actorName}</div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 font-mono font-bold text-xs rounded-lg">
                        <Activity size={12} className="text-indigo-600" />
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-700">
                      {log.entity}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-medium max-w-md">
                      <div>{log.details || "Action executed"}</div>
                      {log.after && (
                        <div className="mt-1 text-[11px] font-mono bg-slate-100 text-slate-700 p-1.5 rounded-lg overflow-x-auto">
                          {JSON.stringify(log.after)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
