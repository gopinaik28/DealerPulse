"use client";

import { Card, CardHeader } from "@/components/ui";
import { EmptyState } from "@/components/states";
import { num, pct, stageLabel } from "@/lib/format";

/**
 * Stepped conversion funnel. Each stage bar is width-proportional to the leads
 * that ever reached it, split into advanced / still-open / lost-here, with the
 * drop-off to the next stage called out on the right.
 */
export function FunnelChart({ funnel, title = "Lead funnel", subtitle }) {
  const stages = funnel?.stages || [];
  const top = stages[0]?.reached || 0;

  if (!top) {
    return (
      <Card>
        <CardHeader title={title} subtitle={subtitle} />
        <div className="card-pad">
          <EmptyState title="No leads in this scope" hint="Try a wider period or clear the source filter." />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={title}
        subtitle={subtitle || `${num(top)} leads entered · ${num(funnel.lost_total)} lost overall`}
      />
      <div className="card-pad space-y-2.5">
        {stages.map((s, i) => {
          const widthPct = Math.max(4, (s.reached / top) * 100);
          const isLast = i === stages.length - 1;
          const advanced = isLast ? 0 : s.advanced;
          const seg = (n) => (s.reached ? (n / s.reached) * 100 : 0);
          return (
            <div key={s.stage} className="flex items-center gap-3">
              <div className="w-24 shrink-0 text-right text-xs font-medium text-ink-soft">
                {stageLabel(s.stage)}
              </div>
              <div className="flex-1">
                <div className="flex h-8 overflow-hidden rounded-md bg-line/50" style={{ width: `${widthPct}%` }}>
                  {isLast ? (
                    <Seg pct={100} className="bg-good" />
                  ) : (
                    <>
                      <Seg pct={seg(advanced)} className="bg-accent" />
                      <Seg pct={seg(s.still_here)} className="bg-accent/35" />
                      <Seg pct={seg(s.lost_here)} className="bg-bad/45" />
                    </>
                  )}
                </div>
              </div>
              <div className="nums w-14 shrink-0 text-right text-sm font-semibold text-ink">
                {num(s.reached)}
              </div>
              <div className="nums w-16 shrink-0 text-right text-xs">
                {isLast ? (
                  <span className="text-good">delivered</span>
                ) : s.drop_pct > 0 ? (
                  <span className={s.drop_pct >= 0.35 ? "text-bad" : "text-ink-faint"}>
                    −{pct(s.drop_pct)}
                  </span>
                ) : (
                  <span className="text-ink-faint">—</span>
                )}
              </div>
            </div>
          );
        })}
        <Legend />
      </div>
    </Card>
  );
}

function Seg({ pct, className }) {
  if (pct <= 0) return null;
  return <div className={className} style={{ width: `${pct}%` }} />;
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-[11px] text-ink-faint">
      <Item className="bg-accent" label="Advanced to next stage" />
      <Item className="bg-accent/35" label="Still open at this stage" />
      <Item className="bg-bad/45" label="Lost from this stage" />
    </div>
  );
}
function Item({ className, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-sm ${className}`} />
      {label}
    </span>
  );
}
