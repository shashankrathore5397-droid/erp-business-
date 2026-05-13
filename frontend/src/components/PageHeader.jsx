export default function PageHeader({ eyebrow, title, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
          {eyebrow}
        </p>
        <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
