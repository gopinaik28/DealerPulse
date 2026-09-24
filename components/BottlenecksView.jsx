"use client";

import { useState } from "react";
import { formatLakhs } from "@/lib/format";

export function BottlenecksView({ staleLeads = [] }) {
  const [triggeredLeads, setTriggeredLeads] = useState({});

  const handleTrigger = (leadId) => {
    setTriggeredLeads((prev) => ({
      ...prev,
      [leadId]: true,
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-warn/20 text-warn">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </span>
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            Actionable Bottleneck Intelligence
          </h2>
        </div>
        <p className="mt-1 text-xs text-ink-soft">
          Automated triage surfacing stalled leads and operational exceptions requiring immediate manager intervention
        </p>
      </div>

      <div className="rounded-xl border border-line bg-surface p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-line/60 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-ink">
              Critical Stalled Leads ({staleLeads.length})
            </h3>
            <p className="text-xs text-ink-soft">
              Open leads with zero status progression in high-value stages
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const all = {};
                staleLeads.forEach((l) => { all[l.lead_id] = true; });
                setTriggeredLeads(all);
              }}
              className="rounded-md border border-accent/40 bg-accent/15 px-3 py-1 text-[11px] font-semibold text-accent hover:bg-accent/25 transition-all"
            >
              ⚡ Batch Triage All ({staleLeads.length})
            </button>
            <span className="rounded-md border border-warn/40 bg-warn/15 px-2.5 py-1 text-[11px] font-semibold text-warn">
              Immediate Action Required
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {staleLeads.map((item) => {
            const isTriggered = triggeredLeads[item.lead_id];
            return (
              <div
                key={item.lead_id}
                className="flex flex-col gap-3 rounded-lg border border-line bg-canvas/70 p-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-accent">{item.lead_id}</span>
                    <span className="font-semibold text-ink">{item.customer_name}</span>
                    <span className="text-xs text-ink-soft">({item.branch_name})</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
                    <span>
                      Assigned to: <strong className="text-ink">{item.rep_name}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Stalled in <strong className="text-warn">{item.current_stage}</strong> for{" "}
                      <strong className="text-warn">{item.days_stale} days</strong>
                    </span>
                    <span>·</span>
                    <span>Deal Value: {formatLakhs(item.deal_value)}</span>
                  </div>
                </div>

                <button
                  disabled={isTriggered}
                  onClick={() => handleTrigger(item.lead_id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                    isTriggered
                      ? "border border-good/40 bg-good/15 text-good cursor-default"
                      : "border border-accent/40 bg-accent/15 text-accent hover:bg-accent/25"
                  }`}
                  title="Simulated action: Logs an operational follow-up task for the assigned rep"
                >
                  {isTriggered ? (
                    <>
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Follow-Up Logged (Simulated)
                    </>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 2L11 13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Log Manager Follow-Up
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
