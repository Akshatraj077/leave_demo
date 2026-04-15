const codeStyles = {
  P: "border-mint/30 bg-mint/10 text-mint",
  L: "border-sky/30 bg-sky/10 text-sky",
  LOP: "border-rose/30 bg-rose/10 text-rose",
  H: "border-gold/30 bg-gold/10 text-gold",
  W: "border-slate-500/30 bg-slate-500/10 text-slate-300"
};

export function CalendarGrid({ days = [] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
      {days.map((day) => (
        <div key={day.date} className="min-h-24 rounded-lg border border-line bg-panel p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-slate-300">{day.date.slice(-2)}</span>
            <span className={`rounded-md border px-2 py-1 text-xs font-bold ${codeStyles[day.code] || codeStyles.P}`}>
              {day.code}
            </span>
          </div>
          <p className="mt-3 text-sm font-medium text-slate-200">{day.label}</p>
          <p className="mt-1 text-xs text-slate-500">{day.meta}</p>
        </div>
      ))}
    </div>
  );
}
