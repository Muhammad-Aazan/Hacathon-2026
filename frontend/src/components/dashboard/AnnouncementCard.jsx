export default function AnnouncementCard({ title, description }) {
  return (
    <div className="rounded-2xl bg-slate-900 p-5 text-white shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-200">{description}</p>
    </div>
  );
}
