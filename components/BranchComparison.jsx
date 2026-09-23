"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardHeader, SegmentedControl, StatusPill } from "@/components/ui";
import { EmptyState } from "@/components/states";
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
  // Bars are drawn on a true 0–100% scale (not normalised to the leader) so the
  // group's distance from target reads honestly at a glance.
  const scaleMax = Math.max(0.25, ...rows.map((r) => r[key])) * 1.05;

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
      <div className="divide-y divide-line">
        {rows.map((r) => {
          const att = r[key];
          const isCurrent = r.branch_id === currentBranch;
          const barColor =
            r.status === "on_track" ? "bg-good" : r.status === "behind" ? "bg-warn" : "bg-bad";
          return (
            <Link
              key={r.branch_id}
              href={withFilters(`/branches/${r.branch_id}`)}
              className={`group flex items-center gap-4 px-5 py-3.5 transition hover:bg-canvas ${
                isCurrent ? "bg-accent-soft/60" : ""
              }`}
            >
              <div className="w-40 shrink-0">
                <div className="flex items-center gap-2 text-sm font-medium text-ink">
                  {r.name}
                  {isCurrent && <span className="text-[10px] font-semibold text-accent">VIEWING</span>}
                </div>
                <div className="text-xs text-ink-faint">{r.city}</div>
              </div>

              <div className="flex flex-1 items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                  <div
                    className={`h-full rounded-full ${barColor}`}
                    style={{ width: `${Math.max(1.5, Math.min(100, (att / scaleMax) * 100))}%` }}
                  />
                </div>
                <div className="nums w-12 text-right text-sm font-semibold text-ink">{pct(att)}</div>
              </div>

              <div className="nums hidden w-28 text-right text-xs text-ink-soft sm:block">
                {metric === "units"
                  ? `${num(r.units_delivered)} / ${num(r.target_units)}`
                  : `${inr(r.revenue_delivered)} / ${inr(r.target_revenue)}`}
              </div>
              <div className="hidden w-20 justify-end md:flex">
                <StatusPill status={r.status} />
              </div>
              <svg
                className="h-4 w-4 shrink-0 text-ink-faint transition group-hover:translate-x-0.5 group-hover:text-ink"
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
