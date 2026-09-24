"use client";

import Link from "next/link";
import { Card, CardHeader, StatusPill } from "@/components/ui";
import { EmptyState } from "@/components/states";
import { SegmentedControl } from "@/components/ui";
import { useState } from "react";
import { useFilters } from "@/lib/useFilters";
import { inr, num, pct } from "@/lib/format";

/**
 * Worst-first branch ranking with an inline attainment bar. Rows link to the
 * branch drill-down. `currentBranch` highlights the row you're already viewing.
 */
export function BranchComparison({ rows, currentBranch, title = "Branch attainment vs target" }) {
  const { withFilters } = useFilters();
  const [metric, setMetric] = useState("units");

  if (!rows?.length) {
    return (
      <Card>
        <CardHeader title={title} />
        <div className="card-pad">
          <EmptyState title="No branch data for this filter" />
        </div>
      </Card>
    );
  }

  const key = metric === "units" ? "attainment_units" : "attainment_revenue";
  const maxAtt = Math.max(0.001, ...rows.map((r) => r[key]));

  return (
    <Card>
      <CardHeader
        title={title}
        subtitle="Sorted lowest attainment first — the branches to look at."
        right={
          <SegmentedControl
            value={metric}
            onChange={setMetric}
            options={[
              { value: "units", label: "Units" },
              { value: "revenue", label: "Revenue" },
            ]}
          />
        }
      />
      <div className="divide-y divide-line/60">
        {rows.map((r) => {
          const att = r[key];
          const isCurrent = r.branch_id === currentBranch;
          const barGradient =
            r.status === "on_track"
              ? "bg-gradient-to-r from-emerald-500 to-teal-400"
              : r.status === "behind"
              ? "bg-gradient-to-r from-amber-500 to-yellow-400"
              : "bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400";
          return (
            <Link
              key={r.branch_id}
              href={withFilters(`/branches/${r.branch_id}`)}
              className={`group flex items-center gap-4 px-5 py-3.5 transition hover:bg-cardHover ${
                isCurrent ? "bg-accent/10 border-l-2 border-accent" : ""
              }`}
            >
              <div className="w-40 shrink-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink group-hover:text-accent transition">
                  {r.name}
                  {isCurrent && <span className="text-[10px] font-bold text-accent px-1.5 py-0.5 rounded bg-accent/20">CURRENT</span>}
                </div>
                <div className="text-xs text-ink-faint">{r.city}</div>
              </div>

              <div className="flex flex-1 items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-line/80 shadow-inner">
                  <div
                    className={`h-full rounded-full ${barGradient} transition-all duration-500`}
                    style={{ width: `${Math.max(2, (att / maxAtt) * 100)}%` }}
                  />
                </div>
                <div className="nums w-12 text-right text-sm font-bold text-ink">{pct(att)}</div>
              </div>

              <div className="nums hidden w-28 text-right text-xs text-ink-soft sm:block font-medium">
                {metric === "units"
                  ? `${num(r.units_delivered)} / ${num(r.target_units)}`
                  : `${inr(r.revenue_delivered)} / ${inr(r.target_revenue)}`}
              </div>
              <div className="hidden w-20 justify-end md:flex">
                <StatusPill status={r.status} />
              </div>
              <svg
                className="h-4 w-4 shrink-0 text-ink-faint transition group-hover:translate-x-1 group-hover:text-accent"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
