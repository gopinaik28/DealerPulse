"use client";

import { formatPct } from "@/lib/format";

const SOURCES_DATA = [
  { source: "Walk-in", conv: 0.557, delivered: 64, lost: 51, tone: "good", tag: "Highest Conversion" },
  { source: "Referral", conv: 0.347, delivered: 25, lost: 47, tone: "accent", tag: "High Intent" },
  { source: "Auto Expo", conv: 0.342, delivered: 13, lost: 25, tone: "accent", tag: "Exhibition Leads" },
  { source: "Website", conv: 0.315, delivered: 28, lost: 61, tone: "warn", tag: "Digital Organic" },
  { source: "Phone Enquiry", conv: 0.294, delivered: 20, lost: 48, tone: "ink-soft", tag: "Inbound Calls" },
  { source: "Social Media", conv: 0.152, delivered: 10, lost: 56, tone: "bad", tag: "Budget Drain (3.7x lower)" },
];

export function LeadSourceROI() {
  return (
    <div className="card card-pad flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-ink">
              Marketing ROI &amp; Source Quality
            </h3>
            <span className="rounded-full border border-bad/30 bg-bad/10 px-2 py-0.5 text-[10px] font-bold text-bad">
              3.7x Variance
            </span>
          </div>
          <span className="text-[11px] font-medium text-ink-faint">Decided Leads</span>
        </div>
        <p className="mt-0.5 text-xs text-ink-soft">
          Conversion win rate across lead acquisition channels — identify where CAC is being wasted
        </p>
      </div>

      <div className="my-3 space-y-2.5">
        {SOURCES_DATA.map((s) => {
          const widthPct = Math.round(s.conv * 100);
          const barBg =
            s.tone === "good"
              ? "bg-good"
              : s.tone === "bad"
              ? "bg-bad"
              : s.tone === "warn"
              ? "bg-warn"
              : "bg-accent";

          return (
            <div key={s.source} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-ink">{s.source}</span>
                  <span className="text-[10px] text-ink-faint">({s.delivered} Delivered / {s.lost} Lost)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-ink-soft">{s.tag}</span>
                  <span className="nums font-bold text-ink w-12 text-right">{formatPct(s.conv)}</span>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/60">
                <div className={`h-full rounded-full ${barBg}`} style={{ width: `${widthPct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Executive Strategic Alert */}
      <div className="rounded-lg border border-line bg-canvas/90 p-2.5 text-xs text-ink-soft">
        <strong className="text-ink">Executive Takeaway:</strong> Walk-ins convert at{" "}
        <strong className="text-good">55.7%</strong> vs Social Media at{" "}
        <strong className="text-bad">15.2%</strong>. Reallocate digital ad spend toward showroom walk-in driving initiatives.
      </div>
    </div>
  );
}
