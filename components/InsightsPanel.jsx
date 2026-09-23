"use client";

import Link from "next/link";
import { Card, CardHeader, StatusPill } from "@/components/ui";
import { CardSkeleton, EmptyState, ErrorState } from "@/components/states";
import { useFilters } from "@/lib/useFilters";
import { getInsights } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useMeta } from "@/components/MetaProvider";
import { inr, num, pct, monthLabel, relativeDays, sourceLabel, stageLabel } from "@/lib/format";

/**
 * "Needs Attention" — the actionable panel. Fetches /api/insights itself so it
 * can live in a sidebar independent of the page's primary payload.
 */
export function InsightsPanel({ branch }) {
  const meta = useMeta();
  const { query } = useFilters();
  const { data, error, loading, refetch } = useApi(
    ({ signal }) => getInsights({ ...query, branch }, { signal }),
    [query.month, query.source, branch],
  );

  if (loading) return <CardSkeleton lines={6} />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const { stale_leads, target_risk, funnel_dropoff, branch_summaries } = data;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-ink">Needs attention</h2>
        <span className="pill border-line bg-white text-ink-faint">as of {meta.as_of_label}</span>
      </div>

      <StaleLeadsCard data={stale_leads} branch={branch} />
      <TargetRiskCard data={target_risk} branch={branch} />
      <DropOffCard data={funnel_dropoff} showSources={!query.source} />
      <SummariesCard summaries={branch_summaries} scopedBranch={branch} month={query.month} />
    </div>
  );
}

/* --------------------------------------------------------------------- */
function StaleLeadsCard({ data, branch }) {
  const { withFilters } = useFilters();
  if (!data.total) {
    return (
      <Card>
        <CardHeader title="Stale leads" subtitle={`No open lead has been idle ${data.threshold_days}+ days.`} />
        <div className="card-pad">
          <EmptyState title="Pipeline is current" hint="Every open lead has recent activity." />
        </div>
      </Card>
    );
  }
  const o = data.oldest;
  return (
    <Card>
      <CardHeader
        title="Stale leads"
        subtitle={`Open, no activity in ${data.threshold_days}+ days`}
        right={<span className="nums text-sm font-semibold text-bad">{num(data.total)}</span>}
      />
      <div className="card-pad space-y-3">
        <div className="rounded-lg bg-bad-soft px-3 py-2 text-xs text-ink-soft">
          <span className="font-semibold text-bad">{inr(data.value_at_risk)}</span> of pipeline value sitting idle.
        </div>
        {o && (
          <div className="rounded-lg border border-line px-3 py-2 text-xs">
            <div className="eyebrow">Oldest</div>
            <div className="mt-1 font-medium text-ink">
              {o.customer_name} · {o.model_interested}
            </div>
            <div className="mt-0.5 text-ink-soft">
              {stageLabel(o.status)} · {o.branch} · {o.rep} · idle {relativeDays(o.days_since_activity)} ·{" "}
              {inr(o.deal_value)}
            </div>
          </div>
        )}
        {!branch && data.by_branch.length > 1 && (
          <div className="space-y-1">
            {data.by_branch.map((b) => (
              <Link
                key={b.branch_id}
                href={withFilters(`/branches/${b.branch_id}`)}
                className="flex items-center justify-between rounded-md px-2 py-1 text-xs hover:bg-canvas"
              >
                <span className="text-ink-soft">{b.name}</span>
                <span className="nums font-medium text-ink">
                  {num(b.count)} · {inr(b.value_at_risk)}
                </span>
              </Link>
            ))}
          </div>
        )}
        {data.by_rep.length > 0 && (
          <div>
            <div className="eyebrow mb-1">Reps to nudge</div>
            <div className="space-y-1">
              {data.by_rep.slice(0, 5).map((r) => (
                <div key={r.rep_id} className="flex items-center justify-between text-xs">
                  <span className="text-ink-soft">
                    {r.name} <span className="text-ink-faint">· {r.branch}</span>
                  </span>
                  <span className="nums font-medium text-ink">
                    {num(r.count)} {r.count === 1 ? "lead" : "leads"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

/* --------------------------------------------------------------------- */
function TargetRiskCard({ data, branch }) {
  const rows = branch ? data.branches.filter((b) => b.branch_id === branch) : data.branches;
  const pace = data.month_over
    ? `${monthLabel(data.month)} is closed`
    : `${data.days_remaining} days left in ${monthLabel(data.month)} · ${pct(data.pct_month_elapsed)} elapsed`;

  return (
    <Card>
      <CardHeader
        title="Target risk"
        subtitle={pace}
        right={
          !branch && (
            <span className="nums text-sm font-semibold text-warn">
              {data.at_risk_count}/{data.branches.length}
            </span>
          )
        }
      />
      <div className="divide-y divide-line">
        {rows.map((b) => (
          <div key={b.branch_id} className="flex items-center justify-between gap-3 px-5 py-2.5">
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-ink">{b.name}</div>
              <div className="nums text-[11px] text-ink-faint">
                {num(b.units_delivered)} / {num(b.target_units)} units
                {!data.month_over && b.projected_units !== b.units_delivered && (
                  <> · proj. {num(b.projected_units)}</>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="nums text-xs font-semibold text-ink">{pct(b.projected_attainment)}</span>
              <StatusPill status={b.verdict} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* --------------------------------------------------------------------- */
function DropOffCard({ data, showSources = true }) {
  const { withFilters } = useFilters();
  const w = data.org_worst;
  return (
    <Card>
      <CardHeader title="Funnel drop-off" subtitle="Where the group leaks the most leads" />
      <div className="card-pad space-y-3">
        {w ? (
          <div className="rounded-lg bg-accent-soft px-3 py-2 text-xs text-ink-soft">
            Biggest leak: <span className="font-semibold text-ink">{stageLabel(w.from)} → {stageLabel(w.to)}</span>{" "}
            loses <span className="font-semibold text-bad">{pct(w.drop_pct)}</span> ({num(w.drop_count)} leads)
            of the {num(w.reached)} that get there.
          </div>
        ) : (
          <EmptyState title="Not enough leads to analyse drop-off" />
        )}

        {data.by_branch.length > 0 && (
          <div>
            <div className="eyebrow mb-1">Worst stage by branch</div>
            <div className="space-y-1">
              {data.by_branch.slice(0, 5).map((b) => (
                <Link
                  key={b.branch_id}
                  href={withFilters(`/branches/${b.branch_id}`)}
                  className="flex items-center justify-between rounded-md px-2 py-1 text-xs hover:bg-canvas"
                >
                  <span className="text-ink-soft">{b.name}</span>
                  <span className="text-ink">
                    {stageLabel(b.from)} → {stageLabel(b.to)}{" "}
                    <span className="nums font-medium text-bad">−{pct(b.drop_pct)}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {showSources && data.by_source.length > 0 && (
          <div>
            <div className="eyebrow mb-1">Source quality (conversion)</div>
            <div className="space-y-1">
              {data.by_source.map((s) => (
                <div key={s.source} className="flex items-center gap-2 text-xs">
                  <span className="w-24 shrink-0 text-ink-soft">{sourceLabel(s.source)}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${Math.max(2, s.conversion_rate * 100)}%` }}
                    />
                  </div>
                  <span className="nums w-10 text-right font-medium text-ink">{pct(s.conversion_rate)}</span>
                  <span className="nums w-8 text-right text-ink-faint">{num(s.leads)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

/* --------------------------------------------------------------------- */
function SummariesCard({ summaries, scopedBranch, month }) {
  const rows = scopedBranch ? summaries.filter((s) => s.branch_id === scopedBranch) : summaries;
  if (!rows.length) return null;
  return (
    <Card>
      <CardHeader
        title="Branch readouts"
        subtitle={month && month !== "all" ? `Paced against ${monthLabel(month)}` : "Paced against December"}
      />
      <div className="divide-y divide-line">
        {rows.map((s) => (
          <div key={s.branch_id} className="px-5 py-3">
            <div className="mb-1 text-xs font-semibold text-ink">{s.name}</div>
            <p className="text-xs leading-relaxed text-ink-soft">{s.text}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
