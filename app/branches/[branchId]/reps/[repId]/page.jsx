"use client";

import { use } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ScopeKpis } from "@/components/KpiSets";
import { FunnelChart } from "@/components/FunnelChart";
import { LeadTable } from "@/components/LeadTable";
import { CardSkeleton, ChartSkeleton, EmptyState, ErrorState } from "@/components/states";
import { KpiGrid } from "@/components/KpiCard";
import { useApi } from "@/lib/useApi";
import { getRep } from "@/lib/api";
import { useFilters } from "@/lib/useFilters";
import { monthLabel, sourceLabel } from "@/lib/format";

export default function RepPage({ params }) {
  const { branchId, repId } = use(params);
  const { query } = useFilters();
  const { data, error, loading, refetch } = useApi(
    ({ signal }) => getRep(repId, query, { signal }),
    [repId, query.month, query.source],
  );

  const scope = data?.scope;

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs
          trail={[
            { label: "Organisation", href: "/" },
            { label: scope?.branch_name || branchId, href: `/branches/${branchId}` },
            { label: scope?.rep_name || repId },
          ]}
        />
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-ink">{scope?.rep_name || repId}</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {scope
            ? `${scope.role === "branch_manager" ? "Branch manager" : "Sales officer"} · ${scope.branch_name}`
            : "Rep"}{" "}
          · {monthLabel(query.month)}
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
          <ChartSkeleton height={220} />
          <CardSkeleton lines={8} />
        </div>
      )}

      {error && <ErrorState error={error} onRetry={refetch} />}

      {data && (
        <>
          <ScopeKpis kpis={data.kpis} scope="rep" />
          {data.lead_count === 0 ? (
            <EmptyState
              title="No leads assigned"
              hint={
                scope?.role === "branch_manager"
                  ? "Branch managers oversee the team and don't carry a personal pipeline in this dataset."
                  : "This rep has no leads for the selected filters."
              }
            />
          ) : (
            <div className="space-y-6">
              <div className="lg:max-w-2xl">
                <FunnelChart
                  funnel={data.funnel}
                  title="Rep funnel"
                  subtitle={`Leads created in ${monthLabel(query.month)}`}
                />
              </div>
              <LeadTable leads={data.leads} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
