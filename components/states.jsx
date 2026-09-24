"use client";

export function SkeletonBlock({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

export function CardSkeleton({ lines = 3, className = "" }) {
  return (
    <div className={`card card-pad ${className}`}>
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="mt-3 h-7 w-32" />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock key={i} className="mt-3 h-3 w-full" />
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 260, label }) {
  return (
    <div className="card">
      <div className="border-b border-line px-5 py-4">
        <SkeletonBlock className="h-4 w-40" />
      </div>
      <div className="card-pad">
        <div className="skeleton w-full" style={{ height }} />
        {label && <p className="mt-3 text-xs text-ink-faint">{label}</p>}
      </div>
    </div>
  );
}

export function EmptyState({ title = "No data for this view", hint }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface/40 px-6 py-12 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-line/60 text-accent">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18" />
          <path d="M7 14l3-3 4 4 5-6" />
        </svg>
      </div>
      <p className="mt-3 text-sm font-semibold text-ink">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  const notFound = error?.status === 404;
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 px-6 py-12 text-center">
      <p className="text-sm font-bold text-rose-400">
        {notFound ? "Not found" : "Something went wrong"}
      </p>
      <p className="mt-1 max-w-sm text-xs text-ink-soft">{String(error?.message || error)}</p>
      {onRetry && !notFound && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:bg-card hover:border-accent/40 transition"
        >
          Try again
        </button>
      )}
    </div>
  );
}
