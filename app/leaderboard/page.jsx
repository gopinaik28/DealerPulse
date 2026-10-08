"use client";

import { useApi } from "@/lib/useApi";
import { getLeaderboard, getOverview } from "@/lib/api";
import { useFilters } from "@/lib/useFilters";
import { monthLabel } from "@/lib/format";
import { ExecutiveBriefing } from "@/components/ExecutiveBriefing";
import { SalesLeaderboard } from "@/components/SalesLeaderboard";
import { CardSkeleton, ErrorState } from "@/components/states";

export default function LeaderboardPage() {
  const { query } = useFilters();
  const {
    data: leaderboardData,
    error,
    loading,
    refetch,
  } = useApi(
    ({ signal }) => getLeaderboard(query, { signal }),
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
        kpis={overviewData?.kpis}
        onRefresh={refetch}
      />

      {loading && <CardSkeleton lines={10} />}
      {error && <ErrorState error={error} onRetry={refetch} />}

      {leaderboardData && <SalesLeaderboard reps={leaderboardData.reps} />}
    </div>
  );
}
