export function EmptyState({ title = "Nothing here yet", message = "New activity will appear here." }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-white/[0.03] p-6 text-center">
      <p className="font-semibold text-slate-200">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
    </div>
  );
}
