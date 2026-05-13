import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((toast) => {
    const id = crypto.randomUUID();
    const next = {
      id,
      type: toast.type || "info",
      message: toast.message || "Action complete.",
      duration: toast.duration ?? 3200,
    };
    setToasts((current) => [next, ...current]);
    if (next.duration > 0) {
      setTimeout(() => removeToast(id), next.duration);
    }
  }, [removeToast]);

  const value = useMemo(
    () => ({
      pushToast,
      removeToast,
      toasts,
    }),
    [pushToast, removeToast, toasts],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}

export function ToastViewport() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="pointer-events-none fixed right-6 top-6 z-50 flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-sm shadow-card backdrop-blur ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : toast.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-900"
                : "border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-100"
          }`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            className="text-xs font-semibold uppercase tracking-wide opacity-60 hover:opacity-100"
            onClick={() => removeToast(toast.id)}
          >
            Close
          </button>
        </div>
      ))}
    </div>
  );
}
