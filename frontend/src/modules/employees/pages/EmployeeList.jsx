import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../../services/api";
import { Search, Plus, User, Eye, Edit2 } from "lucide-react";

export default function EmployeeList() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [status, setStatus] = useState("All");

  const { data, isLoading } = useQuery({
    queryKey: ["employees", search, department, status],
    queryFn: () =>
      api
        .get(`/employees?search=${search}&department=${department}&status=${status}`)
        .then((r) => r.data),
  });

  const { data: deptData } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.get("/setup/departments").then((r) => r.data),
  });

  const employees = data?.employees || [];
  const departments = deptData?.departments || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Employee Directory</h1>
          <p className="text-xs sm:text-sm text-slate-700 font-medium mt-0.5">Manage personnel profiles, roles, and status</p>
        </div>
        <Link to="/employees/add" className="btn-primary">
          <Plus size={16} /> Register Employee
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, ID, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d.name}>{d.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="probation">Probation</option>
            <option value="exited">Exited</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-800 font-black uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-4">Employee</th>
                <th className="px-5 py-4">ID</th>
                <th className="px-5 py-4">Department</th>
                <th className="px-5 py-4">Designation</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-5 py-4">
                      <div className="h-6 bg-slate-100 rounded-lg w-full" />
                    </td>
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-600">
                    <User size={36} className="mx-auto mb-2 opacity-40 text-slate-600" />
                    <p className="font-extrabold text-slate-900 text-sm">No employees found</p>
                    <p className="text-xs text-slate-600 mt-1">Try adjusting your search criteria or register a new employee.</p>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-xs shrink-0">
                          {emp.userId?.name?.[0]?.toUpperCase() || "E"}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 leading-tight text-sm">{emp.userId?.name || "Unnamed Employee"}</p>
                          <p className="text-xs text-slate-600 font-semibold">{emp.userId?.email || "No email"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-black text-slate-800">{emp.employeeId}</td>
                    <td className="px-5 py-4 text-slate-900 font-bold">{emp.department}</td>
                    <td className="px-5 py-4 text-slate-700 font-bold">{emp.designation}</td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          emp.status === "active"
                            ? "badge-active"
                            : emp.status === "probation"
                            ? "badge-probation"
                            : "badge-exited"
                        }
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/employees/${emp._id}`}
                          className="p-2 rounded-lg text-slate-700 hover:text-indigo-700 hover:bg-indigo-100 transition-colors"
                          title="View Profile"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          to={`/employees/${emp._id}/edit`}
                          className="p-2 rounded-lg text-slate-700 hover:text-indigo-700 hover:bg-indigo-100 transition-colors"
                          title="Edit Employee"
                        >
                          <Edit2 size={16} />
                        </Link>
                      </div>
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
