import { Download, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getApiError } from "../api.js";
import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { demoInvoices } from "../data/demoData.js";
import { compactDate, currency } from "../format.js";
import { createInvoice, deleteInvoice, fetchInvoices } from "../services/invoices.js";
import { useToast } from "../state/ToastContext.jsx";

const emptyItem = { description: "", quantity: 1, price: 0 };
const emptyInvoice = {
  number: "",
  customer: "",
  date: new Date().toISOString().slice(0, 10),
  tax_rate: 18,
  items: [emptyItem],
};

const statuses = ["draft", "sent", "paid", "overdue"];

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState(emptyInvoice);
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { pushToast } = useToast();

  async function loadInvoices() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchInvoices();
      setInvoices(data);
      setPage(1);
    } catch (apiError) {
      setInvoices(demoInvoices);
      setError(getApiError(apiError, "Invoices could not be loaded."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  const itemsTotal = useMemo(
    () => form.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.price), 0),
    [form.items],
  );

  const taxValue = useMemo(
    () => (itemsTotal * Number(form.tax_rate || 0)) / 100,
    [itemsTotal, form.tax_rate],
  );

  const grandTotal = itemsTotal + taxValue;

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      amount: grandTotal,
      items: form.items.filter((item) => item.description),
      status: "draft",
    };

    try {
      const created = await createInvoice(payload);
      setInvoices((current) => [created, ...current]);
      setForm({ ...emptyInvoice, number: `INV-${Math.floor(20000 + Math.random() * 90000)}` });
      pushToast({ type: "success", message: "Invoice draft created." });
    } catch (apiError) {
      setError(getApiError(apiError, "Invoice could not be saved."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(invoice) {
    setError("");
    try {
      await deleteInvoice(invoice.id);
      setInvoices((current) => current.filter((item) => item.id !== invoice.id));
      pushToast({ type: "success", message: "Invoice removed." });
    } catch (apiError) {
      setError(getApiError(apiError, "Invoice could not be deleted."));
    }
  }

  function addItem() {
    setForm((current) => ({ ...current, items: [...current.items, emptyItem] }));
  }

  function updateItem(index, field, value) {
    setForm((current) => {
      const items = [...current.items];
      items[index] = { ...items[index], [field]: value };
      return { ...current, items };
    });
  }

  function removeItem(index) {
    setForm((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function downloadInvoice(invoice) {
    const popup = window.open("", "", "width=900,height=700");
    if (!popup) return;
    popup.document.write(`
      <html>
        <head>
          <title>${invoice.number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; }
            h1 { margin: 0 0 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th, td { border-bottom: 1px solid #e2e8f0; padding: 8px; text-align: left; }
            th { text-transform: uppercase; font-size: 12px; color: #64748b; }
          </style>
        </head>
        <body>
          <h1>${invoice.number}</h1>
          <p>Customer: ${invoice.customer}</p>
          <p>Date: ${invoice.date}</p>
          <p>Status: ${invoice.status}</p>
          <table>
            <tr><th>Description</th><th>Items</th><th>Amount</th></tr>
            <tr><td>Invoice total</td><td>${invoice.items || "-"}</td><td>${invoice.amount}</td></tr>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `);
    popup.document.close();
  }

  const filtered = invoices.filter((invoice) => {
    const matchesQuery = `${invoice.number} ${invoice.customer}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedInvoices = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Billing"
        title="Invoices"
        action={
          <button
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-ocean-500 hover:text-ocean-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            type="button"
            onClick={loadInvoices}
          >
            <RefreshCw size={16} aria-hidden="true" />
            Refresh
          </button>
        }
      />

      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Create invoice</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Draft a new invoice with GST calculations.
            </p>
          </div>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Invoice number
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                value={form.number}
                onChange={(event) => setForm({ ...form, number: event.target.value })}
                placeholder="INV-24021"
                required
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Customer
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                value={form.customer}
                onChange={(event) => setForm({ ...form, customer: event.target.value })}
                required
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Invoice date
              <input
                type="date"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
              />
            </label>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Invoice items</p>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                onClick={addItem}
              >
                <Plus size={14} /> Add item
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {form.items.map((item, index) => (
                <div key={`${index}-item`} className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_auto]">
                  <input
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-800"
                    placeholder="Description"
                    value={item.description}
                    onChange={(event) => updateItem(index, "description", event.target.value)}
                  />
                  <input
                    type="number"
                    min="1"
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-800"
                    value={item.quantity}
                    onChange={(event) => updateItem(index, "quantity", Number(event.target.value))}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-800"
                    value={item.price}
                    onChange={(event) => updateItem(index, "price", Number(event.target.value))}
                  />
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              GST / Tax rate (%)
              <input
                type="number"
                min="0"
                max="28"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                value={form.tax_rate}
                onChange={(event) => setForm({ ...form, tax_rate: Number(event.target.value) })}
              />
            </label>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <p>Subtotal: {currency(itemsTotal)}</p>
              <p>GST: {currency(taxValue)}</p>
              <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">
                Total: {currency(grandTotal)}
              </p>
            </div>
          </div>

          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ocean-600 px-4 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-ocean-700"
            disabled={saving}
            type="submit"
          >
            <Plus size={17} aria-hidden="true" />
            {saving ? "Saving" : "Create invoice"}
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
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Invoice list</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {loading ? "Loading" : `${invoices.length} invoices`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <input
                className="bg-transparent text-sm outline-none"
                placeholder="Search invoices"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">All</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 && !loading ? (
          <div className="mt-6">
            <EmptyState title="No invoices" body="Draft a new invoice to see it here." />
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="pb-3">Invoice</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pagedInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="py-4 font-semibold text-slate-900 dark:text-white">
                      {invoice.number}
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-300">
                      {invoice.customer}
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-300">
                      {compactDate(invoice.date)}
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-300">
                      {currency(invoice.amount)}
                    </td>
                    <td className="py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                          type="button"
                          title="Download invoice"
                          onClick={() => downloadInvoice(invoice)}
                        >
                          <Download size={16} />
                        </button>
                        <button
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 text-rose-600 transition hover:bg-rose-50"
                          type="button"
                          title="Delete invoice"
                          onClick={() => handleDelete(invoice)}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
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
