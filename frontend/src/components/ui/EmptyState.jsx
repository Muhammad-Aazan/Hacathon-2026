export default function EmptyState({ title = "No data", description = "Nothing to show right now." }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
      <h3 className="text-lg font-medium text-slate-700">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}
