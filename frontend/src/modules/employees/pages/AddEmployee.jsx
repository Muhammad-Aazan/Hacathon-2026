import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { gsap } from "gsap";
import api from "../../../services/api";
import toast from "react-hot-toast";
import { ArrowLeft, User, Briefcase, DollarSign, Loader2, Check } from "lucide-react";

export default function AddEmployee() {
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    tempPassword: "password123",
    employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
    department: "",
    designation: "",
    phone: "",
    address: "",
    basicSalary: 60000,
    allowances: 15000,
    status: "active",
  });
  const [loading, setLoading] = useState(false);

  const { data: deptData } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.get("/setup/departments").then((r) => r.data),
  });

  const departments = deptData?.departments || [];

  useEffect(() => {
    if (departments.length > 0 && !form.department) {
      setForm((prev) => ({
        ...prev,
        department: departments[0].name,
        designation: departments[0].designations?.[0] || "Specialist",
      }));
    }
  }, [departments]);

  useEffect(() => {
    gsap.from(formRef.current, { y: 15, duration: 0.35, ease: "power2.out" });
  }, []);

  const handleDeptChange = (deptName) => {
    const selected = departments.find((d) => d.name === deptName);
    setForm({
      ...form,
      department: deptName,
      designation: selected?.designations?.[0] || "Specialist",
    });
  };

  const basic = Number(form.basicSalary) || 0;
  const allowances = Number(form.allowances) || 0;
  const hra = Math.round(basic * 0.40);
  const medical = Math.round(basic * 0.10);
  const grossSalary = Math.round(basic * 1.50 + allowances);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.employeeId) {
      toast.error("Please fill required fields (Name, Email, Employee ID)");
      return;
    }
    setLoading(true);
    try {
      await api.post("/employees/register", {
        ...form,
        salaryStructure: {
          basic,
          hra,
          medical,
          allowances,
          gross: grossSalary,
        },
      });
      toast.success("Employee registered successfully! 🎉");
      navigate("/employees");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register employee");
    } finally {
      setLoading(false);
    }
  };

  const currentDept = departments.find((d) => d.name === form.department);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/employees" className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Register New Employee</h1>
          <p className="text-xs text-slate-500">Create employee record, credentials, and salary structure</p>
        </div>
      </div>

      {/* Form */}
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Details */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-indigo-600 font-bold text-sm">
            <User size={18} /> Personal Information
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sarah Khan"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Work Email Address *</label>
              <input
                type="email"
                required
                placeholder="sarah@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number</label>
              <input
                type="tel"
                placeholder="+92 300 1234567"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Residential Address</label>
              <input
                type="text"
                placeholder="Karachi, Pakistan"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Job Role */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-indigo-600 font-bold text-sm">
            <Briefcase size={18} /> Employment & Organization Details
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Employee ID *</label>
              <input
                type="text"
                required
                value={form.employeeId}
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                className="input-field font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Department</label>
              <select
                value={form.department}
                onChange={(e) => handleDeptChange(e.target.value)}
                className="input-field bg-white"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Designation</label>
              <select
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                className="input-field bg-white"
              >
                {currentDept?.designations?.map((des) => (
                  <option key={des} value={des}>{des}</option>
                )) || <option value="Specialist">Specialist</option>}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Salary Structure */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 text-indigo-600 font-bold text-sm">
            <span className="flex items-center gap-2"><DollarSign size={18} /> Official Compensation Structure (PKR)</span>
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Gross: PKR {grossSalary.toLocaleString()} / mo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Basic Monthly Salary (PKR) *</label>
              <input
                type="number"
                min="0"
                value={form.basicSalary}
                onChange={(e) => setForm({ ...form, basicSalary: Number(e.target.value) })}
                className="input-field font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Other Allowances (PKR)</label>
              <input
                type="number"
                min="0"
                value={form.allowances}
                onChange={(e) => setForm({ ...form, allowances: Number(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>

          {/* PDF Formula Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Basic</span>
              <p className="font-extrabold text-slate-900 mt-0.5">PKR {basic.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">HRA (40%)</span>
              <p className="font-extrabold text-indigo-600 mt-0.5">PKR {hra.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Medical (10%)</span>
              <p className="font-extrabold text-emerald-600 mt-0.5">PKR {medical.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Gross (1.5x + Allow)</span>
              <p className="font-extrabold text-slate-900 mt-0.5">PKR {grossSalary.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/employees" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Check size={16} /> Register Employee</>}
          </button>
        </div>
      </form>
    </div>
  );
}
