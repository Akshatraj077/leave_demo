import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { FormField, inputClass } from "../components/FormField.jsx";

const officeImage =
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "info@magicalabs.com",
    companyId: "ADMIN001",
    password: "Admin@123"
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(form);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function useDemo(email, companyId, password) {
    setForm({ email, companyId, password });
  }

  return (
    <main className="grid min-h-screen bg-ink text-slate-100 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]">
      <section className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg border border-sky/40 bg-sky/10 font-bold text-sky">
              ML
            </div>
            <h1 className="text-3xl font-bold">Leave work that feels clear.</h1>
            <p className="mt-3 text-slate-400">Sign in to manage balances, requests, holidays, and employee master data.</p>
          </div>

          <form className="space-y-4 rounded-lg border border-line bg-panel p-5" onSubmit={handleSubmit}>
            <FormField label="Company email">
              <input className={inputClass} type="email" value={form.email} onChange={(event) => update("email", event.target.value)} />
            </FormField>
            <FormField label="Company ID">
              <input className={inputClass} value={form.companyId} onChange={(event) => update("companyId", event.target.value.toUpperCase())} />
            </FormField>
            <FormField label="Password">
              <input className={inputClass} type="password" value={form.password} onChange={(event) => update("password", event.target.value)} />
            </FormField>
            {error ? <p className="rounded-md border border-rose/40 bg-rose/10 px-3 py-2 text-sm text-rose">{error}</p> : null}
            <button className="primary-btn w-full" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button className="secondary-btn" onClick={() => useDemo("info@magicalabs.com", "ADMIN001", "Admin@123")}>
              Admin demo
            </button>
            <button className="secondary-btn" onClick={() => useDemo("arjun@magicalabs.com", "EMP001", "Employee@123")}>
              Employee demo
            </button>
          </div>
        </div>
      </section>

      <section className="hidden min-h-screen overflow-hidden lg:block">
        <img className="h-full w-full object-cover opacity-80" src={officeImage} alt="Modern office workspace" />
      </section>
    </main>
  );
}
