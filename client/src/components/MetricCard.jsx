export function MetricCard({ label, value, tone = "sky", helper }) {
  const tones = {
    sky: "text-sky",
    mint: "text-mint",
    gold: "text-gold",
    rose: "text-rose"
  };

  return (
    <div className="rounded-lg border border-line bg-panel p-4 shadow-glow">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-3 text-3xl font-bold ${tones[tone] || tones.sky}`}>{value}</p>
      {helper ? <p className="mt-2 min-h-5 text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}
