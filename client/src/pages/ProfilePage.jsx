import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { FormField, inputClass } from "../components/FormField.jsx";
import { toInputDate } from "../utils/format.js";

const fields = [
  ["dateOfBirth", "Date of birth", "date"],
  ["panNumber", "PAN number", "text"],
  ["bankAccountNumber", "Account number", "text"],
  ["bankName", "Bank name", "text"],
  ["ifscCode", "IFSC code", "text"],
  ["accountHolderName", "Account holder name", "text"],
  ["location", "Location", "text"]
];

export function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .profile()
      .then((payload) => {
        setProfile(payload.profile);
        setForm({
          dateOfBirth: toInputDate(payload.profile.dateOfBirth),
          panNumber: payload.profile.panNumber || "",
          bankAccountNumber: payload.profile.bankAccountNumber || "",
          bankName: payload.profile.bankName || "",
          ifscCode: payload.profile.ifscCode || "",
          accountHolderName: payload.profile.accountHolderName || "",
          location: payload.profile.location || ""
        });
      })
      .catch((err) => setError(err.message));
  }, []);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = await api.updateProfile(form);
      setProfile(payload.profile);
      setMessage("Profile updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!profile && !error) {
    return <p className="text-slate-400">Loading profile...</p>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-sm text-slate-500">Employee master data</p>
        <h2 className="text-2xl font-bold">Profile</h2>
      </div>

      {profile ? (
        <section className="rounded-lg border border-line bg-panel p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Name</p>
              <p className="font-semibold">{profile.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Company ID</p>
              <p className="font-semibold">{profile.companyId}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="font-semibold">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Employment status</p>
              <p className="font-semibold">{profile.employmentStatus?.replace("_", " ")}</p>
            </div>
          </div>
        </section>
      ) : null}

      <form className="space-y-4 rounded-lg border border-line bg-panel p-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map(([key, label, type]) => (
            <FormField key={key} label={label}>
              <input
                className={inputClass}
                type={type}
                value={form[key] || ""}
                onChange={(event) => update(key, ["panNumber", "ifscCode"].includes(key) ? event.target.value.toUpperCase() : event.target.value)}
              />
            </FormField>
          ))}
        </div>
        {error ? <p className="rounded-md border border-rose/40 bg-rose/10 px-3 py-2 text-sm text-rose">{error}</p> : null}
        {message ? <p className="rounded-md border border-mint/40 bg-mint/10 px-3 py-2 text-sm text-mint">{message}</p> : null}
        <button className="primary-btn" disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
      </form>
    </div>
  );
}
