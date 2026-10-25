import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { gsap } from "gsap";
import api from "../../../services/api";
import toast from "react-hot-toast";
import { ArrowLeft, User, Briefcase, DollarSign, Loader2, Check } from "lucide-react";

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    department: "",
    designation: "",
    phone: "",
    address: "",
    basicSalary: 0,
    allowances: 0,
    status: "active",
  });
  const [loading, setLoading] = useState(false);

  const { data: empData, isLoading: empLoading } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => api.get(`/employees/${id}`).then((r) => r.data),
  });

  const { data: deptData } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.get("/setup/departments").then((r) => r.data),
  });

  const departments = deptData?.departments || [];

  useEffect(() => {
    if (empData?.employee) {
      const e = empData.employee;
      setForm({
        name: e.userId?.name || "",
        department: e.department || "",
        designation: e.designation || "",
        phone: e.phone || "",
        address: e.address || "",
        basicSalary: e.salaryStructure?.basic || 0,
        allowances: e.salaryStructure?.allowances || 0,
        status: e.status || "active",
      });
    }
  }, [empData]);

  useEffect(() => {
    gsap.from(formRef.current, { y: 20, opacity: 0, duration: 0.45, ease: "power2.out" });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/employees/${id}`, form);
      toast.success("Employee profile updated! ✨");
      navigate("/employees");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update employee");
    } finally {
      setLoading(false);
    }
  };

  const grossSalary = (Number(form.basicSalary) || 0) + (Number(form.allowances) || 0);

  if (empLoading) {
    return <div className="p-8 text-center text-slate-400">Loading employee details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/employees" className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Employee Profile</h1>
          <p className="text-xs text-slate-500">Update role assignments, salary structure, and status</p>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-indigo-600 font-bold text-sm">
            <User size={18} /> Personal Information
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Residential Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-indigo-600 font-bold text-sm">
            <Briefcase size={18} /> Department & Status
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Department</label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="input-field bg-white"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Designation</label>
              <input
                type="text"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Employment Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="input-field bg-white font-medium"
              >
                <option value="active">Active</option>
                <option value="probation">Probation</option>
                <option value="exited">Exited</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-indigo-600 font-bold text-sm">
            <span className="flex items-center gap-2"><DollarSign size={18} /> Salary Package (PKR)</span>
            <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Gross: PKR {grossSalary.toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Basic Monthly Salary (PKR)</label>
              <input
                type="number"
                min="0"
                value={form.basicSalary}
                onChange={(e) => setForm({ ...form, basicSalary: Number(e.target.value) })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Monthly Allowances (PKR)</label>
              <input
                type="number"
                min="0"
                value={form.allowances}
                onChange={(e) => setForm({ ...form, allowances: Number(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/employees" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Check size={16} /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}
