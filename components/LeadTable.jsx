"use client";

import { useMemo, useState } from "react";
import { Card, CardHeader, SegmentedControl } from "@/components/ui";
import { EmptyState } from "@/components/states";
import { LeadDetailModal } from "@/components/LeadDetailModal";
import { dateLabel, inr, relativeDays, sourceLabel, stageLabel } from "@/lib/format";

const STATUS_TONE = {
  new: "bg-line text-ink-soft",
  contacted: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
  test_drive: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
  negotiation: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  order_placed: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  delivered: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  lost: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
};

/** A rep's full lead list with quick search, status filtering, and audit trail drawer. */
export function LeadTable({ leads }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);

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
    let list = leads;
    if (filter === "open") list = list.filter((l) => l.is_open);
    else if (filter === "stale") list = list.filter((l) => l.is_stale);
    else if (filter !== "all") list = list.filter((l) => l.status === filter);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.customer_name?.toLowerCase().includes(q) ||
          l.phone?.includes(q) ||
          l.model_interested?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [leads, filter, search]);

  const exportCSV = () => {
    const headers = ["ID", "Customer", "Phone", "Model", "Source", "Status", "Deal Value", "Last Activity"];
    const csvContent = [
      headers.join(","),
      ...rows.map((r) =>
        [
          r.id,
          `"${r.customer_name}"`,
          r.phone,
          `"${r.model_interested}"`,
          r.source,
          r.status,
          r.deal_value,
          r.last_activity_at,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dealerpulse-leads-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Card>
        <CardHeader
          title="Assigned Leads"
          subtitle={`${leads.length} leads assigned to this sales officer`}
          right={
            <div className="flex flex-wrap items-center gap-2">
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
              <button
                onClick={exportCSV}
                title="Export visible leads to CSV"
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

        {/* Search input bar */}
        <div className="border-b border-line/60 px-5 py-2.5 bg-surface/30">
          <div className="relative max-w-sm">
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
              placeholder="Search customer, phone, or car model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-line bg-card py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-ink-faint focus:border-accent/50 focus:outline-none"
            />
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="card-pad">
            <EmptyState title="No leads match this filter or search query" />
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
              <tbody className="divide-y divide-line/60">
                {rows.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => setSelectedLead(l)}
                    className="hover:bg-cardHover cursor-pointer transition"
                  >
                    <td className="px-5 py-3">
                      <div className="font-semibold text-ink flex items-center gap-2">
                        {l.customer_name}
                        <span className="text-[10px] text-accent opacity-0 hover:opacity-100 font-normal">View Audit →</span>
                      </div>
                      <div className="text-xs text-ink-faint">{l.phone}</div>
                    </td>
                    <td className="px-3 py-3 text-ink-soft font-medium">{l.model_interested}</td>
                    <td className="px-3 py-3 text-ink-soft text-xs">{sourceLabel(l.source)}</td>
                    <td className="px-3 py-3">
                      <span className={`pill ${STATUS_TONE[l.status] || "bg-line text-ink-soft"}`}>
                        {stageLabel(l.status)}
                      </span>
                      {l.is_stale && (
                        <span className="ml-1.5 pill border-rose-500/30 bg-rose-500/15 text-rose-400">
                          stale
                        </span>
                      )}
                      {l.status === "lost" && l.lost_reason && (
                        <div className="mt-1 text-[11px] text-rose-400/90 truncate max-w-[180px]" title={l.lost_reason}>
                          {l.lost_reason}
                        </div>
                      )}
                    </td>
                    <td className="nums px-3 py-3 text-right font-semibold text-ink">
                      {inr(l.deal_value, { decimals: 1 })}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="nums text-ink-soft font-medium">{relativeDays(l.days_since_activity)}</div>
                      <div className="nums text-[11px] text-ink-faint">{dateLabel(l.last_activity_at)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Audit Drawer Modal */}
      {selectedLead && (
        <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </>
  );
}
