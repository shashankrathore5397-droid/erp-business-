import { Bell, Lock, Moon, Sun } from "lucide-react";

import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../state/AuthContext.jsx";
import { useTheme } from "../state/ThemeContext.jsx";

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <section className="space-y-6">
      <PageHeader eyebrow="Workspace" title="Settings" />

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Profile</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage personal access and contact details.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Name
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                {[user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.username}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Email</p>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                {user?.email || "Not set"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Role</p>
              <p className="mt-2 text-sm font-semibold capitalize text-slate-900 dark:text-white">
                {user?.role || "staff"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Company</p>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                {user?.company?.name || "Workspace"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Appearance</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Toggle light and dark mode.</p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                onClick={toggleTheme}
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                {theme === "dark" ? "Light" : "Dark"}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-ocean-500" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Notifications</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Get alerts for invoices and inventory.
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                Low stock alerts
                <input type="checkbox" defaultChecked />
              </label>
              <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                Invoice overdue alerts
                <input type="checkbox" defaultChecked />
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
            <div className="flex items-center gap-3">
              <Lock size={20} className="text-rose-500" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Security</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Manage MFA and session policies.
                </p>
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
              Two-factor authentication: <span className="font-semibold">Required</span>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
