import { Filter, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { api, getApiError } from "../api.js";
import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { currency } from "../format.js";
import { useToast } from "../state/ToastContext.jsx";

const emptyProduct = {
  sku: "",
  name: "",
  description: "",
  unit_price: "",
  cost_price: "",
  quantity: 0,
  reorder_level: 5,
  status: "active",
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const { pushToast } = useToast();

  async function loadProducts() {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/products/");
      setProducts(response.data);
      setPage(1);
    } catch (apiError) {
      setError(getApiError(apiError, "Products could not be loaded."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const inventoryValue = useMemo(
    () => products.reduce((sum, product) => sum + Number(product.inventory_value || 0), 0),
    [products],
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/products/", form);
      setForm(emptyProduct);
      await loadProducts();
      pushToast({ type: "success", message: "Product added." });
    } catch (apiError) {
      setError(getApiError(apiError, "Product could not be saved."));
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(product) {
    setError("");
    try {
      await api.delete(`/products/${product.id}/`);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      pushToast({ type: "success", message: "Product removed." });
    } catch (apiError) {
      setError(getApiError(apiError, "Product could not be deleted."));
    }
  }

  const filtered = products.filter((product) => {
    const haystack = `${product.name} ${product.sku} ${product.description || ""}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedProducts = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Inventory"
        title="Products"
        action={
          <button
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-ocean-500 hover:text-ocean-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            type="button"
            onClick={loadProducts}
          >
            <RefreshCw size={16} aria-hidden="true" />
            Refresh
          </button>
        }
      />

      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Add product</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {currency(inventoryValue)} current inventory value
            </p>
          </div>
        </div>

        <form className="mt-6 grid gap-4 md:grid-cols-3" onSubmit={handleSubmit}>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            SKU
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              value={form.sku}
              onChange={(event) => setForm({ ...form, sku: event.target.value })}
              required
            />
          </label>
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
            Unit price
            <input
              min="0"
              step="0.01"
              type="number"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              value={form.unit_price}
              onChange={(event) => setForm({ ...form, unit_price: event.target.value })}
              required
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Cost price
            <input
              min="0"
              step="0.01"
              type="number"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              value={form.cost_price}
              onChange={(event) => setForm({ ...form, cost_price: event.target.value })}
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Quantity
            <input
              min="0"
              type="number"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              value={form.quantity}
              onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })}
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Reorder level
            <input
              min="0"
              type="number"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              value={form.reorder_level}
              onChange={(event) =>
                setForm({ ...form, reorder_level: Number(event.target.value) })
              }
            />
          </label>
          <label className="md:col-span-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Description
            <textarea
              rows="2"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </label>
          <button
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl bg-ocean-600 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-ocean-700"
            disabled={saving}
            type="submit"
          >
            <Plus size={17} aria-hidden="true" />
            {saving ? "Saving" : "Add product"}
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
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Inventory list</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {loading ? "Loading" : `${products.length} products`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <Search size={16} />
              <input
                className="bg-transparent text-sm outline-none"
                placeholder="Search inventory"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <Filter size={14} />
              Filter
            </button>
          </div>
        </div>

        {filtered.length === 0 && !loading ? (
          <div className="mt-6">
            <EmptyState title="No inventory" body="Products you create appear here." />
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="pb-3">SKU</th>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Stock</th>
                  <th className="pb-3">Unit price</th>
                  <th className="pb-3">Value</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pagedProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="py-4 font-semibold text-slate-900 dark:text-white">
                      {product.sku}
                    </td>
                    <td className="py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.description || "No description"}</p>
                    </td>
                    <td className="py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          product.is_low_stock
                            ? "bg-rose-50 text-rose-600"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {product.quantity}
                      </span>
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-300">
                      {currency(product.unit_price)}
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-300">
                      {currency(product.inventory_value)}
                    </td>
                    <td className="py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                        {product.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 text-rose-600 transition hover:bg-rose-50"
                        type="button"
                        title="Delete product"
                        onClick={() => removeProduct(product)}
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
