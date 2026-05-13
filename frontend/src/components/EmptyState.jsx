export default function EmptyState({ title, body }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
      <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
        {title}
      </p>
      <p className="mt-2">{body}</p>
    </div>
  );
}
