import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { api, getApiError } from "../api.js";
import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { compactDate, currency } from "../format.js";

const emptyOrder = {
  order_number: "",
  customer_name: "",
  customer_email: "",
  status: "draft",
  order_date: new Date().toISOString().slice(0, 10),
  total_amount: "0.00",
};

const statuses = ["draft", "confirmed", "shipped", "cancelled"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyOrder);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadOrders() {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/orders/");
      setOrders(response.data);
    } catch (apiError) {
      setError(getApiError(apiError, "Orders could not be loaded."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/orders/", form);
      setForm({ ...emptyOrder, order_date: new Date().toISOString().slice(0, 10) });
      await loadOrders();
    } catch (apiError) {
      setError(getApiError(apiError, "Order could not be saved."));
    } finally {
      setSaving(false);
    }
  }

  async function removeOrder(order) {
    setError("");
    try {
      await api.delete(`/orders/${order.id}/`);
      setOrders((current) => current.filter((item) => item.id !== order.id));
    } catch (apiError) {
      setError(getApiError(apiError, "Order could not be deleted."));
    }
  }

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Sales"
        title="Orders"
        action={
          <button className="secondary-button" type="button" onClick={loadOrders}>
            <RefreshCw size={16} aria-hidden="true" />
            Refresh
          </button>
        }
      />

      <section className="panel">
        <div className="panel-heading">
          <h3>Add order</h3>
        </div>

        <form className="grid-form" onSubmit={handleSubmit}>
          <label>
            Order number
            <input
              value={form.order_number}
              onChange={(event) => setForm({ ...form, order_number: event.target.value })}
              required
            />
          </label>
          <label>
            Customer
            <input
              value={form.customer_name}
              onChange={(event) => setForm({ ...form, customer_name: event.target.value })}
              required
            />
          </label>
          <label>
            Customer email
            <input
              type="email"
              value={form.customer_email}
              onChange={(event) => setForm({ ...form, customer_email: event.target.value })}
            />
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label>
            Order date
            <input
              type="date"
              value={form.order_date}
              onChange={(event) => setForm({ ...form, order_date: event.target.value })}
              required
            />
          </label>
          <label>
            Total amount
            <input
              min="0"
              step="0.01"
              type="number"
              value={form.total_amount}
              onChange={(event) => setForm({ ...form, total_amount: event.target.value })}
            />
          </label>
          <button className="primary-button form-submit" disabled={saving} type="submit">
            <Plus size={17} aria-hidden="true" />
            {saving ? "Saving" : "Add order"}
          </button>
        </form>
      </section>

      {error && <div className="error-banner">{error}</div>}

      <section className="panel">
        <div className="panel-heading">
          <h3>Order list</h3>
          <span>{loading ? "Loading" : `${orders.length} orders`}</span>
        </div>

        {orders.length === 0 && !loading ? (
          <EmptyState title="No orders" body="Sales orders you create appear here." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.order_number}</td>
                    <td>
                      <strong>{order.customer_name}</strong>
                      <span>{order.customer_email || "No email"}</span>
                    </td>
                    <td>{compactDate(order.order_date)}</td>
                    <td>{currency(order.total_amount)}</td>
                    <td>{order.status}</td>
                    <td>
                      <button
                        className="icon-button danger"
                        type="button"
                        title="Delete order"
                        onClick={() => removeOrder(order)}
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
      </section>
    </section>
  );
}
