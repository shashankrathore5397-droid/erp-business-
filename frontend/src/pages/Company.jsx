import { Save } from "lucide-react";
import { useEffect, useState } from "react";

import { api, getApiError } from "../api.js";
import PageHeader from "../components/PageHeader.jsx";
import { useToast } from "../state/ToastContext.jsx";

const emptyCompany = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

export default function Company() {
  const [company, setCompany] = useState(null);
  const [form, setForm] = useState(emptyCompany);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const { pushToast } = useToast();

  useEffect(() => {
    async function loadCompany() {
      try {
        const response = await api.get("/companies/");
        const activeCompany = response.data[0];
        if (activeCompany) {
          setCompany(activeCompany);
          setForm({
            name: activeCompany.name || "",
            email: activeCompany.email || "",
            phone: activeCompany.phone || "",
            address: activeCompany.address || "",
          });
        }
      } catch (apiError) {
        setError(getApiError(apiError, "Company profile could not be loaded."));
      }
    }

    loadCompany();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!company) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await api.patch(`/companies/${company.id}/`, form);
      setCompany(response.data);
      setMessage("Company profile saved.");
      pushToast({ type: "success", message: "Company profile updated." });
    } catch (apiError) {
      setError(getApiError(apiError, "Company profile could not be saved."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader eyebrow="Tenant" title="Company profile" />

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <section className="max-w-3xl rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {company?.name || "Company details"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {company?.slug || "Current tenant"}
            </p>
          </div>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Company name
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Email
              <input
                type="email"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Phone
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </label>
          </div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Address
            <textarea
              rows="4"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              value={form.address}
              onChange={(event) => setForm({ ...form, address: event.target.value })}
            />
          </label>
          <button
            className="inline-flex items-center gap-2 rounded-2xl bg-ocean-600 px-4 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-ocean-700 disabled:opacity-70"
            disabled={saving || !company}
            type="submit"
          >
            <Save size={17} aria-hidden="true" />
            {saving ? "Saving" : "Save profile"}
          </button>
        </form>
      </section>
    </section>
  );
}
