"use client";

import { useMemo, useState } from "react";
import { Card, CardHeader, SegmentedControl } from "@/components/ui";
import { EmptyState } from "@/components/states";
import { dateLabel, inr, relativeDays, sourceLabel, stageLabel } from "@/lib/format";

const STATUS_TONE = {
  new: "bg-line text-ink-soft",
  contacted: "bg-accent-soft text-accent",
  test_drive: "bg-accent-soft text-accent",
  negotiation: "bg-warn-soft text-warn",
  order_placed: "bg-good-soft text-good",
  delivered: "bg-good-soft text-good",
  lost: "bg-bad-soft text-bad",
};

/** A rep's full lead list with a quick status filter. */
export function LeadTable({ leads }) {
  const [filter, setFilter] = useState("all");

  const counts = useMemo(() => {
    const c = { all: leads.length, open: 0, stale: 0, delivered: 0, lost: 0 };
    for (const l of leads) {
      if (l.is_open) c.open += 1;
      if (l.is_stale) c.stale += 1;
      if (l.status === "delivered") c.delivered += 1;
      if (l.status === "lost") c.lost += 1;
    }
    return c;
  }, [leads]);

  const rows = useMemo(() => {
    if (filter === "all") return leads;
    if (filter === "open") return leads.filter((l) => l.is_open);
    if (filter === "stale") return leads.filter((l) => l.is_stale);
    return leads.filter((l) => l.status === filter);
  }, [leads, filter]);

  return (
    <Card>
      <CardHeader
        title="Leads"
        subtitle={`${leads.length} total`}
        right={
          <SegmentedControl
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: `All ${counts.all}` },
              { value: "open", label: `Open ${counts.open}` },
              { value: "stale", label: `Stale ${counts.stale}` },
              { value: "delivered", label: `Won ${counts.delivered}` },
              { value: "lost", label: `Lost ${counts.lost}` },
            ]}
          />
        }
      />
      {rows.length === 0 ? (
        <div className="card-pad">
          <EmptyState title="No leads match this filter" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase tracking-wider text-ink-faint">
                <th className="px-5 py-2.5 font-semibold">Customer</th>
                <th className="px-3 py-2.5 font-semibold">Model</th>
                <th className="px-3 py-2.5 font-semibold">Source</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
                <th className="px-3 py-2.5 text-right font-semibold">Deal value</th>
                <th className="px-3 py-2.5 text-right font-semibold">Last activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((l) => (
                <tr key={l.id} className="hover:bg-canvas">
                  <td className="px-5 py-3">
                    <div className="font-medium text-ink">{l.customer_name}</div>
                    <div className="text-xs text-ink-faint">{l.phone}</div>
                  </td>
                  <td className="px-3 py-3 text-ink-soft">{l.model_interested}</td>
                  <td className="px-3 py-3 text-ink-soft">{sourceLabel(l.source)}</td>
                  <td className="px-3 py-3">
                    <span className={`pill border-transparent ${STATUS_TONE[l.status] || "bg-line text-ink-soft"}`}>
                      {stageLabel(l.status)}
                    </span>
                    {l.is_stale && <span className="ml-1.5 pill border-bad/30 bg-bad-soft text-bad">stale</span>}
                    {l.status === "lost" && l.lost_reason && (
                      <div className="mt-1 text-[11px] text-ink-faint">{l.lost_reason}</div>
                    )}
                  </td>
                  <td className="nums px-3 py-3 text-right text-ink-soft">{inr(l.deal_value, { decimals: 1 })}</td>
                  <td className="px-3 py-3 text-right">
                    <div className="nums text-ink-soft">{relativeDays(l.days_since_activity)}</div>
                    <div className="nums text-[11px] text-ink-faint">{dateLabel(l.last_activity_at)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
