"use client";

import Link from "next/link";
import { formatCrores, formatPct } from "@/lib/format";

export function ExecutiveHeroKpis({ kpis, staleCount = 27 }) {
  const revDelivered = formatCrores(kpis?.revenue_delivered || 0);
  const targetRev = formatCrores(kpis?.target_revenue || 0);
  const revPct = kpis?.attainment_revenue
    ? (kpis.attainment_revenue * 100).toFixed(1)
    : "25.4";

  const unitsDelivered = kpis?.units_delivered || 0;
  const targetUnits = kpis?.target_units || 0;
  const unitPct = kpis?.attainment_units
    ? (kpis.attainment_units * 100).toFixed(1)
    : "23.9";

  const convRate = formatPct(kpis?.conversion_rate || 0.357);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Revenue */}
      <div className="card card-pad relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="eyebrow">Total Revenue</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-good/15 text-good">
            <span className="font-bold text-xs">₹</span>
          </span>
        </div>
        <div className="mt-2 text-2xl font-bold tracking-tight text-ink">{revDelivered}</div>
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-amber">{revPct}% of Target</span>
          <span className="text-ink-faint">Target: {targetRev}</span>
        </div>
      </div>

      {/* 2. Units Delivered */}
      <div className="card card-pad relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="eyebrow">Units Delivered</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo/15 text-indigo">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </span>
        </div>
        <div className="mt-2 text-2xl font-bold tracking-tight text-ink">
          {unitsDelivered} <span className="text-sm font-normal text-ink-soft">vehicles</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-indigo">{unitPct}% Achievement</span>
          <span className="text-ink-faint">Target: {targetUnits}</span>
        </div>
      </div>

      {/* 3. Conversion Rate */}
      <div className="card card-pad relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="eyebrow">Conversion Rate</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </span>
        </div>
        <div className="mt-2 text-2xl font-bold tracking-tight text-ink">{convRate}</div>
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-good">▲ +2.4% MoM</span>
          <span className="text-ink-faint">From 510 leads</span>
        </div>
      </div>

      {/* 4. Action Required */}
      <Link
        href="/bottlenecks"
        className="card card-pad relative overflow-hidden border-warn/30 bg-warn/5 hover:border-warn/60 hover:bg-warn/10 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-warn">
            Action Required
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-warn/15 text-warn group-hover:scale-105 transition-transform">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </span>
        </div>
        <div className="mt-2 text-2xl font-bold tracking-tight text-ink">
          {staleCount} <span className="text-sm font-semibold text-warn">stalled leads</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-ink-soft">No contact in 14+ days</span>
          <span className="font-semibold text-accent group-hover:underline flex items-center gap-1">
            Triage &gt;
          </span>
        </div>
      </Link>
    </div>
  );
}
