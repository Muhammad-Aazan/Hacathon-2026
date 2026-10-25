export default function Select({ children, className = "", ...props }) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 ${className}`}
    >
      {children}
    </select>
  );
}
