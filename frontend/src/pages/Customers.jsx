import { Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getApiError } from "../api.js";
import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { demoCustomers } from "../data/demoData.js";
import { currency } from "../format.js";
import { createCustomer, deleteCustomer, fetchCustomers } from "../services/customers.js";
import { useToast } from "../state/ToastContext.jsx";

const emptyCustomer = {
  name: "",
  email: "",
  phone: "",
  city: "",
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyCustomer);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const { pushToast } = useToast();

  async function loadCustomers() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchCustomers();
      setCustomers(data);
      setPage(1);
    } catch (apiError) {
      setCustomers(demoCustomers);
      setError(getApiError(apiError, "Customers could not be loaded."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const created = await createCustomer(form);
      setCustomers((current) => [created, ...current]);
      setForm(emptyCustomer);
      pushToast({ type: "success", message: "Customer added." });
    } catch (apiError) {
      setError(getApiError(apiError, "Customer could not be saved."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(customer) {
    setError("");
    try {
      await deleteCustomer(customer.id);
      setCustomers((current) => current.filter((item) => item.id !== customer.id));
      pushToast({ type: "success", message: "Customer removed." });
    } catch (apiError) {
      setError(getApiError(apiError, "Customer could not be deleted."));
    }
  }

  const filtered = customers.filter((customer) => {
    const haystack = `${customer.name} ${customer.email} ${customer.city}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedCustomers = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="CRM"
        title="Customers"
        action={
          <button
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-ocean-500 hover:text-ocean-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            type="button"
            onClick={loadCustomers}
          >
            <RefreshCw size={16} aria-hidden="true" />
            Refresh
          </button>
        }
      />

      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Add customer</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Track buyers and revenue</p>
          </div>
        </div>

        <form className="mt-6 grid gap-4 md:grid-cols-4" onSubmit={handleSubmit}>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Name
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Email
            <input
              type="email"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Phone
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            City
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              value={form.city}
              onChange={(event) => setForm({ ...form, city: event.target.value })}
            />
          </label>
          <button
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl bg-ocean-600 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-ocean-700"
            disabled={saving}
            type="submit"
          >
            <Plus size={17} aria-hidden="true" />
            {saving ? "Saving" : "Add customer"}
          </button>
        </form>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Customer list</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {loading ? "Loading" : `${customers.length} records`}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            <Search size={16} />
            <input
              className="bg-transparent text-sm outline-none"
              placeholder="Search customers"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {filtered.length === 0 && !loading ? (
          <div className="mt-6">
            <EmptyState title="No customers" body="New customers appear here once added." />
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">City</th>
                  <th className="pb-3">Lifetime value</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pagedCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{customer.name}</p>
                      <p className="text-xs text-slate-500">{customer.email || "No email"}</p>
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-300">{customer.phone}</td>
                    <td className="py-4 text-slate-600 dark:text-slate-300">{customer.city}</td>
                    <td className="py-4 text-slate-600 dark:text-slate-300">
                      {currency(customer.lifetime_value || 0)}
                    </td>
                    <td className="py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                        {customer.status || "active"}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 text-rose-600 transition hover:bg-rose-50"
                        type="button"
                        title="Delete customer"
                        onClick={() => handleDelete(customer)}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-slate-200 px-3 py-1 disabled:opacity-40"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-3 py-1 disabled:opacity-40"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </section>
  );
}
