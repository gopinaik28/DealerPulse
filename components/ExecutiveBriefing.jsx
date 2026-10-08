"use client";

import { useState } from "react";

import { formatCrores } from "@/lib/format";

export function ExecutiveBriefing({ monthLabel, kpis, branches, stale, summary, onRefresh }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const attainment = kpis ? (kpis.attainment_revenue * 100).toFixed(1) : "–";
  const unitsAttainment = kpis ? (kpis.attainment_units * 100).toFixed(1) : "–";

  // branch_comparison arrives sorted worst attainment first.
  const worst = branches?.[0];
  const best = branches?.[branches.length - 1];
  const pct = (b) => `${(b.attainment_units * 100).toFixed(1)}%`;

  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-surface p-5 shadow-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6l2.1-2.1" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-ink">
                Executive Intelligence Briefing
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-line bg-canvas px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
                Data as of Dec 31, 2025
              </span>
            </div>
            <p className="mt-1.5 max-w-4xl text-xs leading-relaxed text-ink-soft">
              {summary ? (
                <>
                  <strong className="font-semibold text-ink">Diagnostic Readout: </strong>
                  {summary}
                </>
              ) : (
                <>
                  The group delivered{" "}
                  <strong className="font-semibold text-ink">{unitsAttainment}% of its unit target</strong>{" "}
                  ({attainment}% of revenue target) in {monthLabel}.{" "}
                  {best && worst && best !== worst && (
                    <>
                      Strongest branch: <strong className="font-semibold text-ink">{best.name}</strong> (
                      {best.city}, {pct(best)}). Needs attention:{" "}
                      <strong className="font-semibold text-bad">{worst.name}</strong> ({worst.city},{" "}
                      {pct(worst)}).{" "}
                    </>
                  )}
                  {stale?.total > 0 && (
                    <span className="text-amber">
                      {stale.total} open deals ({formatCrores(stale.value_at_risk)}) have had no movement in
                      14+ days.
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-accent/40 bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent transition-all hover:bg-accent/25 focus:outline-none"
        >
          <svg
            className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 21h5v-5" />
          </svg>
          Refresh Insights
        </button>
      </div>
    </div>
  );
}
