import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../services/api";
import toast from "react-hot-toast";
import { Shield, Trash2, User } from "lucide-react";

export default function UsersManagement() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.get("/admin/users").then((r) => r.data),
  });

  const users = data?.data?.users || [];

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => api.patch(`/admin/users/${id}/role`, { role }),
    onSuccess: () => {
      toast.success("User access role updated! 🛡️");
      queryClient.invalidateQueries(["admin-users"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update role"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      toast.success("User account deleted");
      queryClient.invalidateQueries(["admin-users"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete user"),
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Access & Security</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Control platform authentication accounts and assign administrative roles</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
            <tr>
              <th className="px-5 py-3.5">User Profile</th>
              <th className="px-5 py-3.5">Email</th>
              <th className="px-5 py-3.5">Current Role</th>
              <th className="px-5 py-3.5">Assign Role</th>
              <th className="px-5 py-3.5 text-right">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400">No users found</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                      {u.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    {u.name}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 font-mono text-xs">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className="badge-active capitalize">{u.role}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <select
                      value={u.role}
                      onChange={(e) => roleMutation.mutate({ id: u._id, role: e.target.value })}
                      className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                    >
                      <option value="admin">Admin</option>
                      <option value="hr">HR</option>
                      <option value="employee">Employee</option>
                    </select>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => deleteMutation.mutate(u._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete user"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
