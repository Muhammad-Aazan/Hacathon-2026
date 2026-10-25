import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../services/api";
import toast from "react-hot-toast";
import { Shield, Trash2, UserPlus, KeyRound, CheckCircle, XCircle } from "lucide-react";

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [hrForm, setHrForm] = useState({ name: "", email: "", password: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.get("/admin/users").then((r) => r.data),
  });

  const users = data?.data?.users || [];

  // Create HR Account Mutation
  const createHRMutation = useMutation({
    mutationFn: (formData) => api.post("/admin/create-hr", formData),
    onSuccess: (res) => {
      toast.success(res.data.message || "HR account created successfully!");
      setShowCreateModal(false);
      setHrForm({ name: "", email: "", password: "" });
      queryClient.invalidateQueries(["admin-users"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create HR account"),
  });

  // Toggle Active/Inactive Status Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.patch(`/admin/users/${id}/status`, { isActive }),
    onSuccess: (res) => {
      toast.success(res.data.message || "Status updated!");
      queryClient.invalidateQueries(["admin-users"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to toggle status"),
  });

  // Reset Password Mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }) => api.post(`/admin/users/${id}/reset-password`, { newPassword }),
    onSuccess: (res) => {
      toast.success(res.data.message || "Password reset successfully!");
      setShowResetModal(false);
      setSelectedUser(null);
      setNewPassword("");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to reset password"),
  });

  // Delete User Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      toast.success("User account removed");
      queryClient.invalidateQueries(["admin-users"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete user"),
  });

  const handleCreateHR = (e) => {
    e.preventDefault();
    if (!hrForm.name || !hrForm.email || !hrForm.password) {
      toast.error("Please fill all required fields");
      return;
    }
    createHRMutation.mutate(hrForm);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    resetPasswordMutation.mutate({ id: selectedUser._id, newPassword });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 font-black text-xs rounded-lg uppercase tracking-wider">
              Admin Exclusive
            </span>
            <Shield size={16} className="text-indigo-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-2">
            User Access & HR Credentials
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1">
            Create HR login accounts, manage credentials, activate/deactivate staff, and reset passwords.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <UserPlus size={16} />
          Create HR Account
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Account Status</th>
                <th className="px-5 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                    Loading platform accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                        {u.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <span className="truncate">{u.name}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-mono text-xs">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                          u.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : u.role === "hr"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => statusMutation.mutate({ id: u._id, isActive: !u.isActive })}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                          u.isActive !== false
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                        }`}
                      >
                        {u.isActive !== false ? (
                          <>
                            <CheckCircle size={13} /> Active
                          </>
                        ) : (
                          <>
                            <XCircle size={13} /> Deactivated
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setShowResetModal(true);
                          }}
                          title="Reset Password"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <KeyRound size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete user ${u.name}?`)) {
                              deleteMutation.mutate(u._id);
                            }
                          }}
                          title="Delete User"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create HR Account */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Create HR Manager Account</h3>
            <p className="text-xs text-slate-500 font-medium">
              HR will use these credentials to access registration and daily operations.
            </p>
            <form onSubmit={handleCreateHR} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={hrForm.name}
                  onChange={(e) => setHrForm({ ...hrForm, name: e.target.value })}
                  placeholder="e.g. Sarah Khan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={hrForm.email}
                  onChange={(e) => setHrForm({ ...hrForm, email: e.target.value })}
                  placeholder="hr@company.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={hrForm.password}
                  onChange={(e) => setHrForm({ ...hrForm, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createHRMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  {createHRMutation.isPending ? "Creating..." : "Create HR Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Password */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Reset User Password</h3>
            <p className="text-xs text-slate-500 font-medium">
              Setting a new temporary password for <strong>{selectedUser.name}</strong> ({selectedUser.email}).
            </p>
            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Temporary Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  {resetPasswordMutation.isPending ? "Resetting..." : "Save New Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
