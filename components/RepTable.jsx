"use client";

import Link from "next/link";
import { Card, CardHeader } from "@/components/ui";
import { EmptyState } from "@/components/states";
import { useFilters } from "@/lib/useFilters";
import { inr, num, pct } from "@/lib/format";

const COLS = [
  { key: "units_delivered", label: "Units", fmt: num, align: "right" },
  { key: "conversion_rate", label: "Conv.", fmt: pct, align: "right" },
  { key: "avg_deal_value", label: "Avg deal", fmt: (v) => inr(v, { decimals: 1 }), align: "right" },
  { key: "pipeline_size", label: "Pipeline", fmt: num, align: "right" },
];

/** Rep ranking within a branch. Rows link to the rep drill-down. */
export function RepTable({ reps, branchId }) {
  const { withFilters } = useFilters();
  if (!reps?.length) {
    return (
      <Card>
        <CardHeader title="Sales officers" />
        <div className="card-pad">
          <EmptyState title="No rep activity for this filter" />
        </div>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader title="Sales officers" subtitle="Ranked by units delivered, then conversion" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[11px] uppercase tracking-wider text-ink-faint">
              <th className="px-5 py-2.5 font-semibold">#</th>
              <th className="px-3 py-2.5 font-semibold">Rep</th>
              {COLS.map((c) => (
                <th key={c.key} className="px-3 py-2.5 text-right font-semibold">
                  {c.label}
                </th>
              ))}
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {reps.map((r) => (
              <tr key={r.rep_id} className="group hover:bg-canvas">
                <td className="nums px-5 py-3 text-ink-faint">{r.rank}</td>
                <td className="px-3 py-3">
                  <Link href={withFilters(`/branches/${branchId}/reps/${r.rep_id}`)} className="font-medium text-ink hover:underline">
                    {r.name}
                  </Link>
                  <div className="text-xs text-ink-faint">{num(r.leads_handled)} leads handled</div>
                </td>
                {COLS.map((c) => (
                  <td key={c.key} className="nums px-3 py-3 text-right text-ink-soft">
                    {r[c.key] == null ? "—" : c.fmt(r[c.key])}
                  </td>
                ))}
                <td className="px-3 py-3 text-right">
                  <Link
                    href={withFilters(`/branches/${branchId}/reps/${r.rep_id}`)}
                    className="text-ink-faint transition group-hover:text-ink"
                    aria-label={`Open ${r.name}`}
                  >
                    <svg className="inline h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
