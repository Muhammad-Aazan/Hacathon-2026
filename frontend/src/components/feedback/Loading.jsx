export default function Loading({ label = "Loading..." }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
        <p className="mt-3 text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}
