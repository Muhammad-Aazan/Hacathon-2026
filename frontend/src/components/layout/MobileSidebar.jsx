export default function MobileSidebar() {
  return (
    <div className="border-b border-slate-200 bg-white p-4 lg:hidden">
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-slate-100 px-3 py-1">Menu</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">Employees</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">Attendance</span>
      </div>
    </div>
  );
}
