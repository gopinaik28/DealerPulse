"use client";

import { useState, useMemo } from "react";
import { formatLakhs } from "@/lib/format";

const STATUS_BADGES = {
  new: "border-accent/30 bg-accent/10 text-accent",
  contacted: "border-indigo/30 bg-indigo/10 text-indigo",
  test_drive: "border-good/30 bg-good/10 text-good",
  negotiation: "border-warn/30 bg-warn/10 text-warn",
  order_placed: "border-pink-500/30 bg-pink-500/10 text-pink-400",
  delivered: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  lost: "border-bad/30 bg-bad/10 text-bad",
};

export function AllLeadsTable({ leads = [] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesSearch =
        search === "" ||
        l.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        l.id?.toLowerCase().includes(search.toLowerCase()) ||
        l.model_interested?.toLowerCase().includes(search.toLowerCase()) ||
        l.rep_name?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || l.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            Lead Pipeline & Status History
          </h2>
          <p className="text-xs text-ink-soft">
            Full lifecycle history and real-time tracking for {leads.length} inquiries
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search customer, car, rep..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56 rounded-lg border border-line bg-surface py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
            />
            <svg
              className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-ink-faint"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-line bg-surface py-1.5 px-3 text-xs text-ink focus:border-accent focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="test_drive">Test Drive</option>
            <option value="negotiation">Negotiation</option>
            <option value="order_placed">Order Placed</option>
            <option value="delivered">Delivered</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-canvas/60 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
              <tr>
                <th className="px-5 py-3">Lead ID & Customer</th>
                <th className="px-4 py-3">Branch & Sales Representative</th>
                <th className="px-4 py-3">Vehicle Model</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {filteredLeads.slice(0, 100).map((lead) => {
                const badgeStyle = STATUS_BADGES[lead.status] || "border-line bg-canvas text-ink";
                return (
                  <tr key={lead.id} className="transition-colors hover:bg-card-hover">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-accent">{lead.id}</div>
                      <div className="font-medium text-ink">{lead.customer_name}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-ink">{lead.branch_name}</div>
                      <div className="text-[11px] text-ink-soft">{lead.rep_name}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-ink">{lead.model_interested}</div>
                      <div className="nums text-[11px] text-ink-soft">
                        {formatLakhs(lead.deal_value)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badgeStyle}`}
                      >
                        {lead.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="nums px-4 py-3.5 text-ink-soft">
                      {lead.days_in_stage != null ? `${lead.days_in_stage} days in stage` : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="rounded-lg border border-line bg-canvas px-3 py-1 text-xs font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
                      >
                        Inspect Timeline
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timeline Modal / Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-lg card-pad space-y-4 bg-surface shadow-pop">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-base font-semibold text-ink">
                  {selectedLead.customer_name} ({selectedLead.id})
                </h3>
                <p className="text-xs text-ink-soft">
                  {selectedLead.model_interested} · {selectedLead.branch_name} · Assigned to {selectedLead.rep_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="rounded-lg p-1 text-ink-faint hover:bg-card-hover hover:text-ink"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="eyebrow">Status Journey Audit Trail</h4>
              <div className="relative border-l-2 border-line/80 pl-4 space-y-4">
                {(selectedLead.status_history || []).map((h, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-surface bg-accent" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase text-ink">
                        {h.status.replace("_", " ")}
                      </span>
                      <span className="text-[11px] text-ink-faint">{h.timestamp}</span>
                    </div>
                    {h.note && (
                      <p className="mt-1 rounded-md bg-canvas/80 p-2 text-xs text-ink-soft">
                        "{h.note}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-line pt-3 text-right">
              <button
                onClick={() => setSelectedLead(null)}
                className="rounded-lg bg-line/80 px-4 py-1.5 text-xs font-semibold text-ink hover:bg-line"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
