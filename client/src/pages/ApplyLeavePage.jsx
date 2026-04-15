import { useState } from "react";
import { api } from "../api/client.js";
import { FormField, inputClass } from "../components/FormField.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { formatDate } from "../utils/format.js";

export function ApplyLeavePage() {
  const [form, setForm] = useState({
    date: "",
    duration: "FULL"
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [leave, setLeave] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    setLeave(null);
    try {
      const payload = await api.applyLeave(form);
      setLeave(payload.leave);
      setMessage(payload.leave.leaveType === "LOP" ? "Leave submitted as Loss of Pay because quota is exhausted." : "Leave submitted for approval.");
      setForm({ date: "", duration: "FULL" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-sm text-slate-500">Employee self-service</p>
        <h2 className="text-2xl font-bold">Apply leave</h2>
      </div>

      <form className="space-y-4 rounded-lg border border-line bg-panel p-5" onSubmit={handleSubmit}>
        <FormField label="Leave date">
          <input className={inputClass} type="date" value={form.date} onChange={(event) => update("date", event.target.value)} required />
        </FormField>
        <FormField label="Duration">
          <select className={inputClass} value={form.duration} onChange={(event) => update("duration", event.target.value)}>
            <option value="FULL">Full day</option>
            <option value="HALF">Half day</option>
          </select>
        </FormField>

        <div className="rounded-lg border border-line bg-ink p-4 text-sm text-slate-400">
          Sunday, holiday, duplicate-date, and notice-period requests are blocked. Requests beyond quota become LOP.
        </div>

        {error ? <p className="rounded-md border border-rose/40 bg-rose/10 px-3 py-2 text-sm text-rose">{error}</p> : null}
        {message ? (
          <div className="rounded-md border border-mint/40 bg-mint/10 px-3 py-2 text-sm text-mint">
            <p>{message}</p>
            {leave ? (
              <p className="mt-2 text-slate-300">
                {formatDate(leave.date)} - <StatusBadge value={leave.leaveType} /> - <StatusBadge value={leave.status} />
              </p>
            ) : null}
          </div>
        ) : null}

        <button className="primary-btn" disabled={submitting}>
          {submitting ? "Submitting..." : "Apply leave"}
        </button>
      </form>
    </div>
  );
}
