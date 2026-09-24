"use client";

import { useApi } from "@/lib/useApi";
import { getOverview, getInsights } from "@/lib/api";
import { useFilters } from "@/lib/useFilters";
import { RevenueSimulator } from "@/components/RevenueSimulator";
import { CardSkeleton, ErrorState } from "@/components/states";

export default function SimulatorPage() {
  const { query } = useFilters();
  const {
    data: overviewData,
    error,
    loading,
    refetch,
  } = useApi(
    ({ signal }) => getOverview(query, { signal }),
    [query.month, query.source],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink">
          Interactive Revenue Scenario Simulator
        </h1>
        <p className="mt-1 text-xs text-ink-soft">
          Model how funnel conversion fixes and stalled lead recoveries directly impact group vehicle deliveries and revenue
        </p>
      </div>

      {loading && <CardSkeleton lines={10} />}
      {error && <ErrorState error={error} onRetry={refetch} />}

      {overviewData && (
        <RevenueSimulator
          currentRevenue={overviewData.kpis.revenue_delivered}
          currentUnits={overviewData.kpis.units_delivered}
        />
      )}
    </div>
  );
}
