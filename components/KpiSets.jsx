"use client";

import { KpiCard, KpiGrid } from "@/components/KpiCard";
import { inr, num, pct } from "@/lib/format";

/**
 * Shared KPI layouts for org / branch / rep scopes. A dominant hero row plus a
 * quieter secondary row, so the screen has a clear focal point.
 */
export function ScopeKpis({ kpis, scope = "org" }) {
  const revShare = kpis.target_revenue ? kpis.attainment_revenue : null;
  const unitShare = kpis.target_units ? kpis.attainment_units : null;
  const unitStatus = unitStatusFor(unitShare);

  return (
    <div className="space-y-3">
      <KpiGrid cols={4}>
        <KpiCard
          size="hero"
          label="Revenue delivered"
          value={inr(kpis.revenue_delivered, { decimals: 1 })}
          bar={revShare}
          barTone={revShare == null ? "accent" : toneFor(revShare)}
          foot={
            revShare == null
              ? `${num(kpis.units_delivered)} units delivered`
              : `${pct(revShare)} of ${inr(kpis.target_revenue, { decimals: 0 })} target`
          }
        />
        <KpiCard
          size="hero"
          label="Units delivered"
          value={num(kpis.units_delivered)}
          status={unitStatus}
          bar={unitShare}
          barTone={unitShare == null ? "accent" : toneFor(unitShare)}
          foot={
            unitShare == null
              ? `${inr(kpis.avg_deal_value_delivered, { decimals: 1 })} avg deal`
              : `${pct(unitShare)} of ${num(kpis.target_units)} target`
          }
        />
        <KpiCard
          size="hero"
          label="Conversion rate"
          value={pct(kpis.conversion_rate, { decimals: 1 })}
          hint="Won ÷ (won + lost) among leads resolved in the selected period."
          foot={`${num(kpis.won_in_period)} won of ${num(kpis.resolved_in_period)} resolved`}
        />
        <KpiCard
          size="hero"
          label="Avg days to deliver"
          value={kpis.avg_days_to_deliver ?? "—"}
          unit={kpis.avg_days_to_deliver ? "days" : ""}
          hint="Order-placed date to delivery date, for cars delivered in the period."
          foot={`${inr(kpis.avg_deal_value_delivered, { decimals: 1 })} avg deal value`}
        />
      </KpiGrid>

      <KpiGrid cols={4}>
        <KpiCard label={scope === "rep" ? "Leads handled" : "Leads created"} value={num(kpis.total_leads)} foot={`${num(kpis.open_leads)} still open`} />
        <KpiCard label="Open pipeline" value={num(kpis.pipeline_size)} foot={`${inr(kpis.pipeline_value, { decimals: 1 })} of value`} />
        <KpiCard label="Deals lost" value={num(kpis.lost_leads)} foot="lost decisions in the period" />
        <KpiCard
          label="Deals resolved"
          value={num(kpis.resolved_in_period)}
          foot={`${num(kpis.won_in_period)} won · ${num(kpis.resolved_in_period - kpis.won_in_period)} lost`}
        />
      </KpiGrid>
    </div>
  );
}

function toneFor(share) {
  if (share >= 0.9) return "good";
  if (share >= 0.5) return "warn";
  return "bad";
}
function unitStatusFor(share) {
  if (share == null) return null;
  if (share >= 0.9) return "on_track";
  if (share >= 0.5) return "behind";
  return "critical";
}
