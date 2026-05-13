import { LockKeyhole, LogIn } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";

import { getApiError } from "../api.js";
import { useAuth } from "../state/AuthContext.jsx";

export default function Login() {
  const { isAuthenticated, login, loginWithGoogle } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const googleBtnRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    if (!googleClientId || !googleBtnRef.current) return;

    const scriptId = "google-identity";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.id = scriptId;
      document.body.appendChild(script);
      script.onload = () => initializeGoogle();
    } else {
      initializeGoogle();
    }

    function initializeGoogle() {
      if (!window.google || !googleBtnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          try {
            await loginWithGoogle(response.credential);
          } catch (apiError) {
            setError(getApiError(apiError, "Google login failed."));
          }
        },
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        width: "100%",
      });
    }
  }, [googleClientId, loginWithGoogle]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(form.username, form.password);
    } catch (apiError) {
      setError(getApiError(apiError, "Login failed. Check your username and password."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-shell">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
        <section className="grid w-full gap-8 rounded-3xl border border-white/50 bg-white/80 p-8 shadow-soft backdrop-blur dark:border-white/10 dark:bg-slate-950/80 md:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col justify-between gap-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ocean-500 text-white">
              <LockKeyhole size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Multi-tenant ERP
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
                Sign in to your workspace
              </h1>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                Manage finance, inventory, and HR operations in one connected dashboard.
              </p>
            </div>

          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Username
              <input
                autoComplete="username"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                value={form.username}
                onChange={(event) => setForm({ ...form, username: event.target.value })}
                required
              />
            </label>

            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Password
              <input
                autoComplete="current-password"
                type="password"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
            </label>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ocean-600 px-4 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-ocean-700"
              disabled={submitting}
              type="submit"
            >
              <LogIn size={18} aria-hidden="true" />
              {submitting ? "Signing in" : "Sign in"}
            </button>

            {googleClientId && (
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                <div ref={googleBtnRef} />
              </div>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}
