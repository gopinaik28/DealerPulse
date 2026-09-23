"use client";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ScopeKpis } from "@/components/KpiSets";
import { BranchComparison } from "@/components/BranchComparison";
import { FunnelChart } from "@/components/FunnelChart";
import { TrendChart } from "@/components/TrendChart";
import { InsightsPanel } from "@/components/InsightsPanel";
import { ChartSkeleton, ErrorState } from "@/components/states";
import { KpiGrid } from "@/components/KpiCard";
import { CardSkeleton } from "@/components/states";
import { useApi } from "@/lib/useApi";
import { getOverview } from "@/lib/api";
import { useFilters } from "@/lib/useFilters";
import { monthLabel, sourceLabel } from "@/lib/format";

export default function OverviewPage() {
  const { query } = useFilters();
  const { data, error, loading, refetch } = useApi(
    ({ signal }) => getOverview(query, { signal }),
    [query.month, query.source],
  );

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs trail={[{ label: "Organisation" }]} />
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-ink">Group performance</h1>
        <p className="mt-1 text-sm text-ink-soft">
          All 5 branches · {monthLabel(query.month)}
          {query.source ? ` · ${sourceLabel(query.source)} leads` : ""}
        </p>
      </div>

      {loading && (
        <div className="space-y-6">
          <KpiGrid cols={4}>
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} lines={1} />
            ))}
          </KpiGrid>
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              <ChartSkeleton height={220} />
              <ChartSkeleton height={260} />
            </div>
            <div className="lg:col-span-4">
              <CardSkeleton lines={8} />
            </div>
          </div>
        </div>
      )}

      {error && <ErrorState error={error} onRetry={refetch} />}

      {data && (
        <>
          <ScopeKpis kpis={data.kpis} scope="org" />
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              <BranchComparison rows={data.branch_comparison} />
              <FunnelChart funnel={data.funnel} subtitle={`Leads created in ${monthLabel(query.month)}`} />
              <TrendChart trend={data.trend} />
            </div>
            <aside className="lg:col-span-4">
              <InsightsPanel />
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
