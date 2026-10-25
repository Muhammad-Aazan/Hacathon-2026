export default function Avatar({ name = "User", size = "md" }) {
  const sizeMap = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-12 w-12 text-base" };

  return (
    <div className={`flex items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-700 ${sizeMap[size] || sizeMap.md}`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
