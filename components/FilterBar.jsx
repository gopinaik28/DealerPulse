"use client";

import { useMeta } from "@/components/MetaProvider";
import { useFilters } from "@/lib/useFilters";
import { monthLabel, sourceLabel } from "@/lib/format";

/** Global time-range + source control. Drives every KPI and chart via the URL. */
export function FilterBar() {
  const meta = useMeta();
  const { month, source, setFilters } = useFilters();
  const hasFilters = month !== "all" || source !== "";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        label="Period"
        value={month}
        onChange={(v) => setFilters({ month: v })}
        options={[
          { value: "all", label: "Jun–Dec 2025" },
          ...meta.months.map((m) => ({ value: m, label: monthLabel(m) })),
        ]}
      />
      <Select
        label="Source"
        value={source}
        onChange={(v) => setFilters({ source: v })}
        options={[
          { value: "", label: "All sources" },
          ...meta.sources.map((s) => ({ value: s, label: sourceLabel(s) })),
        ]}
      />
      {hasFilters && (
        <button
          onClick={() => setFilters({ month: "all", source: "" })}
          className="text-xs font-medium text-ink-soft underline-offset-2 hover:text-ink hover:underline"
        >
          Reset
        </button>
      )}
      <span className="ml-auto hidden text-xs text-ink-faint sm:block">
        {source ? `${sourceLabel(source)} · ` : ""}
        {monthLabel(month)}
      </span>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="group relative inline-flex items-center">
      <span className="pointer-events-none absolute left-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring appearance-none rounded-lg border border-line bg-white py-1.5 pl-[58px] pr-8 text-xs font-medium text-ink hover:border-ink-faint"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
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
    </label>
  );
}
