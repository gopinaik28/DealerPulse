"use client";

import { useApi } from "@/lib/useApi";
import { getOverview } from "@/lib/api";
import { useFilters } from "@/lib/useFilters";
import { monthLabel } from "@/lib/format";
import { ExecutiveBriefing } from "@/components/ExecutiveBriefing";
import { BranchCardsGrid } from "@/components/BranchCardsGrid";
import { CardSkeleton, ErrorState } from "@/components/states";

export default function BranchesPage() {
  const { query } = useFilters();
  const { data, error, loading, refetch } = useApi(
    ({ signal }) => getOverview(query, { signal }),
    [query.month, query.source],
  );

  return (
    <div className="space-y-6">
      <ExecutiveBriefing
        monthLabel={monthLabel(query.month)}
        branches={data?.branch_comparison}
        kpis={data?.kpis}
        onRefresh={refetch}
      />

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} lines={5} />
          ))}
        </div>
      )}

      {error && <ErrorState error={error} onRetry={refetch} />}

      {data && <BranchCardsGrid branches={data.branch_comparison} />}
    </div>
  );
}
