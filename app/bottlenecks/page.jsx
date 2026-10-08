"use client";

import { useApi } from "@/lib/useApi";
import { getInsights, getOverview } from "@/lib/api";
import { useFilters } from "@/lib/useFilters";
import { monthLabel } from "@/lib/format";
import { ExecutiveBriefing } from "@/components/ExecutiveBriefing";
import { BottlenecksView } from "@/components/BottlenecksView";
import { CardSkeleton, ErrorState } from "@/components/states";

export default function BottlenecksPage() {
  const { query } = useFilters();
  const {
    data: insightsData,
    error,
    loading,
    refetch,
  } = useApi(
    ({ signal }) => getInsights(query, { signal }),
    [query.month, query.source],
  );

  const { data: overviewData } = useApi(
    ({ signal }) => getOverview(query, { signal }),
    [query.month, query.source],
  );

  return (
    <div className="space-y-6">
      <ExecutiveBriefing
        monthLabel={monthLabel(query.month)}
        branches={overviewData?.branch_comparison}
        stale={insightsData?.stale_leads}
        kpis={overviewData?.kpis}
        onRefresh={refetch}
      />

      {loading && <CardSkeleton lines={8} />}
      {error && <ErrorState error={error} onRetry={refetch} />}

      {insightsData && (
        <BottlenecksView staleLeads={insightsData?.stale_leads?.samples || []} />
      )}
    </div>
  );
}
