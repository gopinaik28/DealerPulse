"use client";

import { useState } from "react";
import { formatCrores } from "@/lib/format";

export function RevenueSimulator({ currentRevenue = 388760000, currentUnits = 160 }) {
  const [conversionBoost, setConversionBoost] = useState(10); // +10%
  const [staleRecoveryRate, setStaleRecoveryRate] = useState(25); // 25% of 27 leads

  // Math: 27 stale leads worth ₹6.28Cr
  const STALE_POOL_VALUE = 62780000;
  const AVG_DEAL_VALUE = 2429750; // ~₹24.3L

  const additionalFromStale = (STALE_POOL_VALUE * (staleRecoveryRate / 100));
  const recoveredUnits = Math.round(additionalFromStale / AVG_DEAL_VALUE);

  // Math: Funnel leak fix (+X% conversion on remaining ~350 non-converted pipeline)
  const additionalFromConversion = (currentRevenue * (conversionBoost / 100) * 0.45);
  const additionalUnitsFromConversion = Math.round(currentUnits * (conversionBoost / 100) * 0.45);

  const totalIncrementalRevenue = additionalFromStale + additionalFromConversion;
  const totalIncrementalUnits = recoveredUnits + additionalUnitsFromConversion;
  const projectedTotalRevenue = currentRevenue + totalIncrementalRevenue;

  return (
    <div className="card card-pad relative overflow-hidden bg-gradient-to-br from-surface via-surface to-accent/5 border-line shadow-card">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-line/60 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </span>
            <h3 className="text-sm font-bold tracking-tight text-ink">
              What-If Revenue Scenario Simulator
            </h3>
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
              Interactive
            </span>
          </div>
          <p className="mt-0.5 text-xs text-ink-soft">
            Model the bottom-line revenue impact of operational funnel fixes and disciplined stalled-lead follow-up
          </p>
        </div>

        {/* Projected Impact Pill */}
        <div className="flex items-baseline gap-2 rounded-xl border border-good/40 bg-good/10 px-3.5 py-1.5 self-start sm:self-auto">
          <span className="text-[11px] font-medium text-ink-soft">Projected Upside:</span>
          <span className="nums text-base font-extrabold text-good">
            +{formatCrores(totalIncrementalRevenue)}
          </span>
          <span className="nums text-xs font-semibold text-good">
            (+{totalIncrementalUnits} vehicles)
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-12 items-center">
        {/* Sliders */}
        <div className="space-y-4 lg:col-span-7">
          {/* Slider 1 */}
          <div>
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-ink">
                1. Test Drive &amp; Negotiation Conversion Improvement
              </span>
              <span className="nums font-bold text-accent">+{conversionBoost}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="5"
              value={conversionBoost}
              onChange={(e) => setConversionBoost(Number(e.target.value))}
              className="mt-1.5 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-line accent-accent"
            />
            <div className="flex justify-between text-[10px] text-ink-faint">
              <span>Baseline (0%)</span>
              <span>+10% (Target fix at Lakeside)</span>
              <span>+25% (Peer parity)</span>
            </div>
          </div>

          {/* Slider 2 */}
          <div>
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-ink">
                2. Stalled Leads Triage &amp; Recovery Rate (₹6.28 Cr pool)
              </span>
              <span className="nums font-bold text-warn">{staleRecoveryRate}% recovered</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={staleRecoveryRate}
              onChange={(e) => setStaleRecoveryRate(Number(e.target.value))}
              className="mt-1.5 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-line accent-warn"
            />
            <div className="flex justify-between text-[10px] text-ink-faint">
              <span>0% (Status quo)</span>
              <span>25% (Realistic 7-day push)</span>
              <span>50% (Max aggressive)</span>
            </div>
          </div>
        </div>

        {/* Live Result Summary Card */}
        <div className="rounded-xl border border-line bg-canvas/80 p-3.5 lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-line/60 pb-1.5">
              <span className="text-ink-soft">Current Delivered Revenue</span>
              <span className="nums font-semibold text-ink">{formatCrores(currentRevenue)}</span>
            </div>
            <div className="flex justify-between border-b border-line/60 pb-1.5">
              <span className="text-ink-soft">Funnel Leak Optimization</span>
              <span className="nums font-semibold text-accent">+{formatCrores(additionalFromConversion)}</span>
            </div>
            <div className="flex justify-between border-b border-line/60 pb-1.5">
              <span className="text-ink-soft">Stalled Leads Recovery</span>
              <span className="nums font-semibold text-warn">+{formatCrores(additionalFromStale)}</span>
            </div>
            <div className="flex justify-between pt-1 text-sm font-bold text-ink">
              <span>New Projected Revenue</span>
              <span className="nums text-good">{formatCrores(projectedTotalRevenue)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
