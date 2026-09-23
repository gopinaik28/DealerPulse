"use client";

import { use } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ScopeKpis } from "@/components/KpiSets";
import { BranchComparison } from "@/components/BranchComparison";
import { FunnelChart } from "@/components/FunnelChart";
import { TrendChart } from "@/components/TrendChart";
import { RepTable } from "@/components/RepTable";
import { InsightsPanel } from "@/components/InsightsPanel";
import { CardSkeleton, ChartSkeleton, ErrorState } from "@/components/states";
import { KpiGrid } from "@/components/KpiCard";
import { useApi } from "@/lib/useApi";
import { getBranch } from "@/lib/api";
import { useFilters } from "@/lib/useFilters";
import { monthLabel, sourceLabel } from "@/lib/format";

export default function BranchPage({ params }) {
  const { branchId } = use(params);
  const { query } = useFilters();
  const { data, error, loading, refetch } = useApi(
    ({ signal }) => getBranch(branchId, query, { signal }),
    [branchId, query.month, query.source],
  );

  const scope = data?.scope;

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs
          trail={[
            { label: "Organisation", href: "/" },
            { label: scope?.branch_name || branchId },
          ]}
        />
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-ink">
          {scope?.branch_name || branchId}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          {scope ? `${scope.city} · team of ${scope.team_size}` : "Branch"}
          {scope?.team_lead ? ` · led by ${scope.team_lead}` : ""} · {monthLabel(query.month)}
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
              <ChartSkeleton height={240} />
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
          <ScopeKpis kpis={data.kpis} scope="branch" />
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              <RepTable reps={data.rep_ranking} branchId={branchId} />
              <FunnelChart
                funnel={data.funnel}
                title="Branch funnel"
                subtitle={`Leads created in ${monthLabel(query.month)}`}
              />
              <TrendChart trend={data.trend} title="Branch delivery trend" />
              <BranchComparison
                rows={data.branch_comparison}
                currentBranch={branchId}
                title="How this branch ranks"
              />
            </div>
            <aside className="lg:col-span-4">
              <InsightsPanel branch={branchId} />
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
