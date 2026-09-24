"use client";

import { useMeta } from "@/components/MetaProvider";
import { useFilters } from "@/lib/useFilters";
import { monthLabel, sourceLabel } from "@/lib/format";

export function HeaderFilters() {
  const meta = useMeta();
  const { month, source, setFilters } = useFilters();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Branch selector or indicator */}
      <div className="relative inline-flex items-center">
        <span className="pointer-events-none absolute left-2.5 text-ink-faint">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </span>
        <select
          onChange={(e) => {
            if (e.target.value === "all") {
              window.location.href = "/";
            } else {
              window.location.href = `/branches/${e.target.value}`;
            }
          }}
          className="appearance-none rounded-lg border border-line bg-surface py-1.5 pl-8 pr-7 text-xs font-semibold text-ink hover:border-line/80 focus:border-accent focus:outline-none"
          defaultValue="all"
        >
          <option value="all">All Branches (5 Locations)</option>
          {meta?.branches?.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.city})
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-2.5 h-3 w-3 text-ink-faint"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {/* Period selector */}
      <div className="relative inline-flex items-center">
        <span className="pointer-events-none absolute left-2.5 text-ink-faint">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </span>
        <select
          value={month}
          onChange={(e) => setFilters({ month: e.target.value })}
          className="appearance-none rounded-lg border border-line bg-surface py-1.5 pl-8 pr-7 text-xs font-semibold text-ink hover:border-line/80 focus:border-accent focus:outline-none"
        >
          <option value="all">Jun – Dec 2025 (Full Period)</option>
          {meta?.months?.map((m) => (
            <option key={m} value={m}>
              {monthLabel(m)}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-2.5 h-3 w-3 text-ink-faint"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {/* Source selector */}
      <div className="relative hidden items-center sm:inline-flex">
        <select
          value={source}
          onChange={(e) => setFilters({ source: e.target.value })}
          className="appearance-none rounded-lg border border-line bg-surface py-1.5 px-3 text-xs font-medium text-ink hover:border-line/80 focus:border-accent focus:outline-none"
        >
          <option value="">All Lead Sources</option>
          {meta?.sources?.map((s) => (
            <option key={s} value={s}>
              {sourceLabel(s)}
            </option>
          ))}
        </select>
      </div>

      {/* Refresh Icon */}
      <button
        onClick={() => window.location.reload()}
        title="Refresh live data"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-ink-soft hover:bg-card-hover hover:text-ink focus:outline-none"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
        </svg>
      </button>
    </div>
  );
}
