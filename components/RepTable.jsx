"use client";

import { useMemo, useState } from "react";
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

/** Rep ranking within a branch with search and CSV export. */
export function RepTable({ reps, branchId }) {
  const { withFilters } = useFilters();
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    if (!reps) return [];
    if (!search.trim()) return reps;
    const q = search.toLowerCase();
    return reps.filter((r) => r.name?.toLowerCase().includes(q) || r.role?.toLowerCase().includes(q));
  }, [reps, search]);

  const exportCSV = () => {
    const headers = ["Rank", "Name", "Role", "Units Delivered", "Conversion Rate", "Avg Deal Value", "Pipeline Size", "Leads Handled"];
    const csvContent = [
      headers.join(","),
      ...rows.map((r) =>
        [
          r.rank,
          `"${r.name}"`,
          r.role,
          r.units_delivered,
          r.conversion_rate,
          r.avg_deal_value,
          r.pipeline_size,
          r.leads_handled,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dealerpulse-reps-${branchId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <CardHeader
        title="Sales officers"
        subtitle="Ranked by units delivered, then conversion"
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="rounded-lg border border-line bg-surface/80 px-2.5 py-1 text-xs font-semibold text-ink-soft hover:text-ink hover:border-accent/40 transition flex items-center gap-1.5"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export
            </button>
          </div>
        }
      />

      <div className="border-b border-line/60 px-5 py-2 bg-surface/30">
        <div className="relative max-w-xs">
          <svg
            className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-ink-faint"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search sales officers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-line bg-card py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-ink-faint focus:border-accent/50 focus:outline-none"
          />
        </div>
      </div>

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
          <tbody className="divide-y divide-line/60">
            {rows.map((r) => (
              <tr key={r.rep_id} className="group hover:bg-cardHover transition">
                <td className="nums px-5 py-3 text-ink-faint font-semibold">{r.rank}</td>
                <td className="px-3 py-3">
                  <Link
                    href={withFilters(`/branches/${branchId}/reps/${r.rep_id}`)}
                    className="font-semibold text-ink hover:text-accent transition flex items-center gap-1.5"
                  >
                    {r.name}
                  </Link>
                  <div className="text-xs text-ink-faint">{num(r.leads_handled)} leads handled</div>
                </td>
                {COLS.map((c) => (
                  <td key={c.key} className="nums px-3 py-3 text-right font-medium text-ink-soft">
                    {r[c.key] == null ? "—" : c.fmt(r[c.key])}
                  </td>
                ))}
                <td className="px-3 py-3 text-right">
                  <Link
                    href={withFilters(`/branches/${branchId}/reps/${r.rep_id}`)}
                    className="text-ink-faint transition group-hover:text-accent inline-flex p-1 hover:bg-surface rounded"
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
