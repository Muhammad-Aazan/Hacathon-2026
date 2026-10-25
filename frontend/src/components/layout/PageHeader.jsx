export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {actions ? <div>{actions}</div> : null}
    </div>
  );
}
