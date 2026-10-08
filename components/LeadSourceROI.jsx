"use client";

import { formatPct, sourceLabel } from "@/lib/format";

// Win rate per lead source, computed server-side (`by_source` on /api/overview).
export function LeadSourceROI({ sources = [] }) {
  const rows = sources.filter((s) => s.delivered + s.lost > 0);
  const best = rows[0];
  const worst = rows[rows.length - 1];
  const ratio = best && worst && worst.win_rate > 0 ? best.win_rate / worst.win_rate : null;

  return (
    <div className="card card-pad flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-ink">
              Lead Source Quality
            </h3>
            {ratio && (
              <span className="rounded-full border border-bad/30 bg-bad/10 px-2 py-0.5 text-[10px] font-bold text-bad">
                {ratio.toFixed(1)}x Variance
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium text-ink-faint">Decided Leads</span>
        </div>
        <p className="mt-0.5 text-xs text-ink-soft">
          Win rate (delivered ÷ delivered + lost) for leads created in the selected period
        </p>
      </div>

      <div className="my-3 space-y-2.5">
        {rows.map((s) => {
          const widthPct = Math.round(s.win_rate * 100);
          const barBg = s === best ? "bg-good" : s === worst ? "bg-bad" : "bg-accent";

          return (
            <div key={s.source} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-ink">{sourceLabel(s.source)}</span>
                  <span className="text-[10px] text-ink-faint">({s.delivered} Delivered / {s.lost} Lost)</span>
                </div>
                <span className="nums font-bold text-ink w-12 text-right">{formatPct(s.win_rate)}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/60">
                <div className={`h-full rounded-full ${barBg}`} style={{ width: `${widthPct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {best && worst && best !== worst && (
        <div className="rounded-lg border border-line bg-canvas/90 p-2.5 text-xs text-ink-soft">
          <strong className="text-ink">Takeaway:</strong> {sourceLabel(best.source)} leads win{" "}
          <strong className="text-good">{formatPct(best.win_rate)}</strong> vs {sourceLabel(worst.source)} at{" "}
          <strong className="text-bad">{formatPct(worst.win_rate)}</strong>. Worth checking spend per channel
          before shifting budget.
        </div>
      )}
    </div>
  );
}
