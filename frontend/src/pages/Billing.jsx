import { CheckCircle2, CreditCard, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import { getApiError } from "../api.js";
import PageHeader from "../components/PageHeader.jsx";
import { demoSubscriptions } from "../data/demoData.js";
import { createCheckout, fetchSubscriptions } from "../services/payments.js";
import { useToast } from "../state/ToastContext.jsx";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "INR 1,999 / month",
    description: "Core ERP modules for small teams.",
    features: ["5 users", "Inventory + CRM", "Email support"],
  },
  {
    id: "growth",
    name: "Growth",
    price: "INR 5,999 / month",
    description: "Advanced analytics and multi-warehouse controls.",
    features: ["30 users", "Multi-company", "Priority support"],
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom pricing",
    description: "Custom SLAs and dedicated finance operations.",
    features: ["Unlimited users", "Dedicated CSM", "Custom integrations"],
  },
];

export default function Billing() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { pushToast } = useToast();

  async function loadSubscriptions() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchSubscriptions();
      setSubscriptions(data);
    } catch (apiError) {
      setSubscriptions(demoSubscriptions);
      setError(getApiError(apiError, "Subscriptions could not be loaded."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubscriptions();
  }, []);

  async function handleCheckout(plan) {
    try {
      const session = await createCheckout({ plan: plan.id, interval: "monthly" });
      if (session?.url) {
        window.location.href = session.url;
        return;
      }
      pushToast({ type: "error", message: "Checkout session missing URL." });
    } catch (apiError) {
      pushToast({ type: "error", message: getApiError(apiError, "Checkout failed.") });
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Payments"
        title="Billing & subscriptions"
        action={
          <button
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-ocean-500 hover:text-ocean-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            type="button"
            onClick={loadSubscriptions}
          >
            <RefreshCw size={16} aria-hidden="true" />
            Refresh
          </button>
        }
      />

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`rounded-3xl border px-6 py-6 shadow-card transition ${
              plan.highlighted
                ? "border-ocean-500 bg-white/90"
                : "border-white/70 bg-white/80"
            } dark:border-slate-800 dark:bg-slate-950/80`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {plan.name}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                  {plan.price}
                </h3>
              </div>
              {plan.highlighted && (
                <span className="rounded-full bg-ocean-50 px-3 py-1 text-xs font-semibold text-ocean-700">
                  Popular
                </span>
              )}
            </div>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
              {plan.description}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ocean-600 px-4 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-ocean-700"
              onClick={() => handleCheckout(plan)}
            >
              <CreditCard size={16} /> Start checkout
            </button>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Active plans</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {loading ? "Loading" : `${subscriptions.length} active subscriptions`}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {subscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {subscription.plan}
                  </p>
                  <p className="text-xs text-slate-500">Renewal: {subscription.renewal}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                  {subscription.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
