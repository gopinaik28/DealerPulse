"use client";

import Link from "next/link";
import { formatCrores, formatPct } from "@/lib/format";

export function BranchCardsGrid({ branches = [] }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          Branch Network Performance
        </h2>
        <p className="text-xs text-ink-soft">
          Detailed quota achievement, sales headcount, and conversion across 5 regional locations
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {branches.map((b) => {
          const revPct = Math.min(100, Math.round((b.attainment_revenue || 0) * 100));
          const unitPct = Math.min(100, Math.round((b.attainment_units || 0) * 100));

          return (
            <div
              key={b.branch_id}
              className="card card-pad flex flex-col justify-between transition-all hover:border-line/90 hover:bg-card-hover"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                    {b.city}
                  </span>
                  <span className="text-[11px] font-medium text-ink-faint">
                    6 Sales Staff
                  </span>
                </div>

                <h3 className="mt-3 text-base font-semibold text-ink">
                  {b.name}
                </h3>

                {/* Revenue Achievement Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-soft">Revenue Achievement</span>
                    <span className="nums font-medium text-ink">
                      {formatCrores(b.revenue_delivered)} / {formatCrores(b.target_revenue)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${revPct}%` }}
                    />
                  </div>
                </div>

                {/* Units Sold Bar */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-soft">Units Sold</span>
                    <span className="nums font-medium text-ink">
                      {b.units_delivered} / {b.target_units}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-good transition-all"
                      style={{ width: `${unitPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-line/50 pt-3 text-xs">
                <span className="text-ink-soft">
                  Conversion Rate:{" "}
                  <strong className="text-accent">
                    {formatPct(b.conversion_rate ?? 0)}
                  </strong>
                </span>
                <Link
                  href={`/branches/${b.branch_id}`}
                  className="inline-flex items-center gap-1 font-semibold text-accent hover:underline"
                >
                  View Branch & Reps
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
