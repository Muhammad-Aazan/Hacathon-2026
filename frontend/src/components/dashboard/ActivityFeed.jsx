export default function ActivityFeed({ items = [] }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Activity</h3>
      <ul className="space-y-3 text-sm text-slate-600">
        {items.map((item, index) => (
          <li key={index} className="border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">{item}</li>
        ))}
      </ul>
    </div>
  );
}
