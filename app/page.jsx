"use client";

import { useApi } from "@/lib/useApi";
import { getOverview, getInsights } from "@/lib/api";
import { useFilters } from "@/lib/useFilters";
import { monthLabel } from "@/lib/format";

import { ExecutiveBriefing } from "@/components/ExecutiveBriefing";
import { ExecutiveHeroKpis } from "@/components/ExecutiveHeroKpis";
import { BranchRevenueTargetChart } from "@/components/BranchRevenueTargetChart";
import { PipelineDonut } from "@/components/PipelineDonut";
import { LeadSourceROI } from "@/components/LeadSourceROI";
import { FunnelChart } from "@/components/FunnelChart";
import { TrendChart } from "@/components/TrendChart";
import { LostAndDeliveryInsights } from "@/components/LostAndDeliveryInsights";
import { CardSkeleton, ChartSkeleton, ErrorState } from "@/components/states";

export default function OverviewPage() {
  const { query } = useFilters();

  const {
    data: overviewData,
    error: overviewError,
    loading: overviewLoading,
    refetch: refetchOverview,
  } = useApi(
    ({ signal }) => getOverview(query, { signal }),
    [query.month, query.source],
  );

  const {
    data: insightsData,
    loading: insightsLoading,
    refetch: refetchInsights,
  } = useApi(
    ({ signal }) => getInsights(query, { signal }),
    [query.month, query.source],
  );

  const handleRefresh = () => {
    refetchOverview();
    refetchInsights();
  };

  const loading = overviewLoading || insightsLoading;
  const error = overviewError;

  // Derive dynamic briefing text from server insights
  const dynamicSummary = insightsData?.branch_summaries?.[0]?.text;

  return (
    <div className="space-y-6">
      {/* 1. Executive Briefing Hero */}
      <ExecutiveBriefing
        monthLabel={monthLabel(query.month)}
        kpis={overviewData?.kpis}
        summary={dynamicSummary}
        onRefresh={handleRefresh}
      />

      {loading && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} lines={2} />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <ChartSkeleton height={240} />
            </div>
            <div className="lg:col-span-4">
              <CardSkeleton lines={6} />
            </div>
          </div>
        </div>
      )}

      {error && <ErrorState error={error} onRetry={handleRefresh} />}

      {overviewData && (
        <>
          {/* 2. Executive Hero KPI Row */}
          <ExecutiveHeroKpis
            kpis={overviewData.kpis}
            staleCount={insightsData?.stale_leads?.total || 27}
          />

          {/* 3. Primary Charts Row: Branch Revenue vs Target + Pipeline Status Donut */}
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <BranchRevenueTargetChart branchRows={overviewData.branch_comparison} />
            </div>
            <div className="lg:col-span-4">
              <PipelineDonut funnel={overviewData.funnel} />
            </div>
          </div>

          {/* 4. Diagnostic Charts: Funnel Drop-Off & Marketing Channel ROI */}
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <FunnelChart
                funnel={overviewData.funnel}
                title="Conversion Funnel & Drop-Off Leakage"
                subtitle={`Progression for leads created in ${monthLabel(query.month)}`}
              />
            </div>
            <div className="lg:col-span-5">
              <LeadSourceROI />
            </div>
          </div>

          {/* 5. Trend & Delivery Delays / Lost Deal Diagnostics */}
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <TrendChart trend={overviewData.trend} title="7-Month Delivery Velocity Trend" />
            </div>
            <div className="lg:col-span-5">
              <LostAndDeliveryInsights
                lostReasons={overviewData.lost_reasons}
                deliveryDelays={overviewData.delivery_delays}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
