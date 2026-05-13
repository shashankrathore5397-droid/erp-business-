import {
  Activity,
  AlertTriangle,
  Boxes,
  BriefcaseBusiness,
  PackageCheck,
  ReceiptText,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getApiError } from "../api.js";
import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Spinner from "../components/Spinner.jsx";
import { demoRevenue } from "../data/demoData.js";
import { compactDate, currency } from "../format.js";
import { fetchDashboard } from "../services/analytics.js";
import { useToast } from "../state/ToastContext.jsx";

const initialStats = {
  employee_count: 0,
  product_count: 0,
  order_count: 0,
  low_stock_count: 0,
  inventory_value: 0,
  revenue: 0,
  recent_products: [],
  recent_employees: [],
};

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { pushToast } = useToast();

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await fetchDashboard();
        setDashboard(data);
      } catch (apiError) {
        setError(getApiError(apiError, "Dashboard could not be loaded."));
        pushToast({ type: "error", message: "Showing demo analytics data." });
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const stats = [
    { label: "Employees", value: dashboard.employee_count, icon: Users, tone: "blue" },
    { label: "Products", value: dashboard.product_count, icon: Boxes, tone: "teal" },
    { label: "Invoices", value: dashboard.order_count, icon: ReceiptText, tone: "amber" },
    { label: "Low stock", value: dashboard.low_stock_count, icon: AlertTriangle, tone: "red" },
    {
      label: "Inventory value",
      value: currency(dashboard.inventory_value),
      icon: PackageCheck,
      tone: "green",
    },
    {
      label: "Revenue",
      value: currency(dashboard.revenue),
      icon: BriefcaseBusiness,
      tone: "violet",
    },
  ];

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        action={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-ocean-500 hover:text-ocean-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <Activity size={16} />
            Export snapshot
          </button>
        }
      />

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6" aria-busy={loading}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article
              className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80"
              key={stat.label}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  {stat.label}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-200">
                  <Icon size={18} aria-hidden="true" />
                </span>
              </div>
              <p className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
                {loading ? "..." : stat.value}
              </p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Updated just now</p>
            </article>
          );
        })}
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Revenue trend
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                Monthly sales growth
              </h3>
            </div>
            <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <TrendingUp size={14} className="inline" /> +12.4%
            </div>
          </div>

          <div className="mt-6 h-64">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Spinner label="Loading chart" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demoRevenue} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenue" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => currency(value)}
                    contentStyle={{ borderRadius: 16, borderColor: "#e2e8f0" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    fill="url(#revenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent products</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Inventory highlights</p>
            <div className="mt-6 space-y-4">
              {dashboard.recent_products.length === 0 ? (
                <EmptyState title="No products yet" body="Create inventory items to fill this view." />
              ) : (
                dashboard.recent_products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900 dark:text-white">{product.quantity}</p>
                      <p className="text-xs text-slate-500">{currency(product.inventory_value)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent employees</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Latest hires</p>
            <div className="mt-6 space-y-4">
              {dashboard.recent_employees.length === 0 ? (
                <EmptyState title="No employees yet" body="Add team members to start managing HR data." />
              ) : (
                dashboard.recent_employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{employee.full_name}</p>
                      <p className="text-xs text-slate-500">
                        {employee.designation || employee.department}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {employee.employee_code}
                      </p>
                      <p className="text-xs text-slate-500">{compactDate(employee.hire_date)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </section>
    </section>
  );
}
