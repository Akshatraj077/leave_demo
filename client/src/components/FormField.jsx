export function FormField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "min-h-11 w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky";
