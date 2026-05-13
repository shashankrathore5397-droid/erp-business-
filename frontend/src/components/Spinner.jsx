export default function Spinner({ label = "Loading" }) {
  return (
    <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
      <span className="relative h-5 w-5">
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-slate-300 border-t-ocean-600 dark:border-slate-700" />
      </span>
      {label}
    </div>
  );
}
