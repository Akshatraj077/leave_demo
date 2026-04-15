const styles = {
  APPLIED: "border-gold/40 bg-gold/10 text-gold",
  APPROVED: "border-mint/40 bg-mint/10 text-mint",
  REJECTED: "border-rose/40 bg-rose/10 text-rose",
  ACTIVE: "border-mint/40 bg-mint/10 text-mint",
  NOTICE_PERIOD: "border-rose/40 bg-rose/10 text-rose",
  PROBATION: "border-sky/40 bg-sky/10 text-sky",
  CL: "border-mint/40 bg-mint/10 text-mint",
  LOP: "border-rose/40 bg-rose/10 text-rose"
};

export function StatusBadge({ value }) {
  return (
    <span className={`inline-flex min-h-7 items-center rounded-md border px-2 py-1 text-xs font-semibold ${styles[value] || "border-line bg-white/5 text-slate-200"}`}>
      {String(value || "NA").replace("_", " ")}
    </span>
  );
}
