export default function Dropdown({ label, children }) {
  return (
    <div className="relative">
      <button className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
        {label}
      </button>
      {children ? <div className="absolute right-0 mt-2 min-w-[180px] rounded-lg border border-slate-200 bg-white p-2 shadow-lg">{children}</div> : null}
    </div>
  );
}
