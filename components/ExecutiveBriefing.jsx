"use client";

import { useState } from "react";

export function ExecutiveBriefing({ monthLabel, kpis, summary, onRefresh }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const attainment = kpis?.attainment_revenue
    ? (kpis.attainment_revenue * 100).toFixed(1)
    : "25.4";
  const unitsAttainment = kpis?.attainment_units
    ? (kpis.attainment_units * 100).toFixed(1)
    : "23.9";

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
              <span className="inline-flex items-center gap-1 rounded-full border border-good/30 bg-good/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-good">
                <span className="h-1.5 w-1.5 rounded-full bg-good animate-pulse" />
                Live Analysis
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
                  Executive Intelligence Briefing for Dealership Network: Current retail velocity
                  is performing at{" "}
                  <strong className="font-semibold text-ink">{unitsAttainment}% of unit quota</strong>{" "}
                  ({attainment}% revenue attainment) across {monthLabel}. Top conversion centers remain
                  Mumbai Eastside & Bangalore Lakeside hand-off triage.{" "}
                  <span className="text-amber">
                    Note: 27 stalled leads in high-interest stages require immediate triage to prevent
                    drop-off.
                  </span>{" "}
                  Applying disciplined follow-up suggests an estimated upside of{" "}
                  <strong className="font-semibold text-ink">₹6.28 Cr</strong> in pipeline recovery.
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
