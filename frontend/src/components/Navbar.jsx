import { LogOut, Moon, Search, ShieldCheck, Sun } from "lucide-react";

import { useAuth } from "../state/AuthContext.jsx";
import { useTheme } from "../state/ThemeContext.jsx";

export default function Navbar() {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.username;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 px-6 py-4 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/85 sm:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
            {user?.company?.name || "ERP Workspace"}
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {displayName}
          </h1>
        </div>

        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <label className="relative flex max-w-md flex-1 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm focus-within:border-ocean-500 focus-within:ring-2 focus-within:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            <Search size={16} aria-hidden="true" />
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              placeholder="Search invoices, customers, products"
              type="search"
              aria-label="Search"
            />
          </label>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <ShieldCheck size={14} aria-hidden="true" />
              {user?.role || "staff"}
            </span>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-ocean-500 hover:text-ocean-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              type="button"
              onClick={logout}
            >
              <LogOut size={16} aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
