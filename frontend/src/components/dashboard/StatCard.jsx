export default function StatCard({ title, value, trend }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{title}</p>
      <div className="mt-3 flex items-end justify-between">
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {trend ? <span className="text-xs text-emerald-600">{trend}</span> : null}
      </div>
    </div>
  );
}
