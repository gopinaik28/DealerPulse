"use client";

import { MiniBar, StatusPill } from "@/components/ui";

/**
 * One KPI. `size="hero"` renders large (top row); default renders compact.
 * `foot` can be a string or JSX; `bar` (0..1) shows an attainment bar.
 */
export function KpiCard({ label, value, unit, foot, bar, barTone = "accent", status, size = "default", hint }) {
  const hero = size === "hero";
  return (
    <div className="card card-pad flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2">
        <span className="eyebrow">{label}</span>
        {status && <StatusPill status={status} />}
        {hint && !status && (
          <span className="text-ink-faint" title={hint}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </span>
        )}
      </div>
      <div className={`nums mt-2 font-semibold text-ink ${hero ? "text-[26px] leading-tight md:text-[30px]" : "text-xl"}`}>
        {value}
        {unit && <span className="ml-1 text-sm font-medium text-ink-faint">{unit}</span>}
      </div>
      {bar != null && <MiniBar value={bar} tone={barTone} className="mt-3" />}
      {foot != null && <div className="mt-2 text-xs text-ink-soft">{foot}</div>}
    </div>
  );
}

export function KpiGrid({ children, cols = 4 }) {
  const map = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  };
  return <div className={`grid grid-cols-1 gap-3 ${map[cols]}`}>{children}</div>;
}
