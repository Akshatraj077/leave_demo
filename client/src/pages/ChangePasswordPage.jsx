import { useState } from "react";
import { api } from "../api/client.js";
import { FormField, inputClass } from "../components/FormField.jsx";

export function ChangePasswordPage() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await api.changePassword(form);
      setForm({ currentPassword: "", newPassword: "" });
      setMessage("Password changed.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <p className="text-sm text-slate-500">Secure account access</p>
        <h2 className="text-2xl font-bold">Change password</h2>
      </div>

      <form className="space-y-4 rounded-lg border border-line bg-panel p-5" onSubmit={handleSubmit}>
        <FormField label="Current password">
          <input className={inputClass} type="password" value={form.currentPassword} onChange={(event) => update("currentPassword", event.target.value)} />
        </FormField>
        <FormField label="New password">
          <input className={inputClass} type="password" value={form.newPassword} onChange={(event) => update("newPassword", event.target.value)} />
        </FormField>
        <p className="text-sm text-slate-500">Use at least 8 characters with uppercase, lowercase, number, and special character.</p>
        {error ? <p className="rounded-md border border-rose/40 bg-rose/10 px-3 py-2 text-sm text-rose">{error}</p> : null}
        {message ? <p className="rounded-md border border-mint/40 bg-mint/10 px-3 py-2 text-sm text-mint">{message}</p> : null}
        <button className="primary-btn" disabled={saving}>{saving ? "Changing..." : "Change password"}</button>
      </form>
    </div>
  );
}
