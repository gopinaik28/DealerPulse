"use client";

import { useApi } from "@/lib/useApi";
import { getAllLeads, getOverview } from "@/lib/api";
import { useFilters } from "@/lib/useFilters";
import { monthLabel } from "@/lib/format";
import { ExecutiveBriefing } from "@/components/ExecutiveBriefing";
import { AllLeadsTable } from "@/components/AllLeadsTable";
import { CardSkeleton, ErrorState } from "@/components/states";

export default function LeadsPage() {
  const { query } = useFilters();
  const {
    data: leadsData,
    error,
    loading,
    refetch,
  } = useApi(
    ({ signal }) => getAllLeads(query, { signal }),
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
        kpis={overviewData?.kpis}
        onRefresh={refetch}
      />

      {loading && <CardSkeleton lines={12} />}
      {error && <ErrorState error={error} onRetry={refetch} />}

      {leadsData && <AllLeadsTable leads={leadsData.leads} />}
    </div>
  );
}
