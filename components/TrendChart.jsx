"use client";

import { useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardHeader, SegmentedControl } from "@/components/ui";
import { EmptyState } from "@/components/states";
import { CHART, inr, monthLabel, num } from "@/lib/format";

/** Monthly delivered actuals (bars) vs target (line), toggleable units / revenue. */
export function TrendChart({ trend, title = "Monthly delivery trend", showTarget = true }) {
  const [metric, setMetric] = useState("units");
  const rows = trend || [];
  const hasData = rows.some((r) => r.units_delivered || r.revenue_delivered);

  const actualKey = metric === "units" ? "units_delivered" : "revenue_delivered";
  const targetKey = metric === "units" ? "target_units" : "target_revenue";
  const fmt = metric === "units" ? num : (v) => inr(v, { decimals: 1 });

  const data = rows.map((r) => ({
    ...r,
    label: monthLabel(r.month, { short: true }),
  }));

  return (
    <Card>
      <CardHeader
        title={title}
        subtitle="Delivered in month vs the group's target."
        right={
          <SegmentedControl
            value={metric}
            onChange={setMetric}
            options={[
              { value: "units", label: "Units" },
              { value: "revenue", label: "Revenue" },
            ]}
          />
        }
      />
      <div className="card-pad">
        {!hasData ? (
          <EmptyState title="No deliveries in this scope" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={CHART.grid} vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} dy={6} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={54}
                tickFormatter={(v) => (metric === "units" ? v : inr(v, { decimals: 0 }))}
              />
              <Tooltip
                cursor={{ fill: "rgba(15,23,42,0.04)" }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-pop">
                      <div className="font-semibold text-ink">{monthLabel(row.month)}</div>
                      <div className="mt-1 flex items-center justify-between gap-6">
                        <span className="text-ink-soft">Delivered</span>
                        <span className="nums font-semibold text-accent">{fmt(row[actualKey])}</span>
                      </div>
                      {showTarget && (
                        <div className="flex items-center justify-between gap-6">
                          <span className="text-ink-soft">Target</span>
                          <span className="nums font-medium text-ink-soft">{fmt(row[targetKey])}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-6">
                        <span className="text-ink-soft">Orders placed</span>
                        <span className="nums font-medium text-ink-soft">{num(row.orders_placed)}</span>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey={actualKey}
                fill={CHART.actual}
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
                isAnimationActive={false}
              />
              {showTarget && (
                <Line
                  type="monotone"
                  dataKey={targetKey}
                  stroke={CHART.target}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-faint">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm" style={{ background: CHART.actual }} /> Delivered
          </span>
          {showTarget && (
            <span className="flex items-center gap-1.5">
              <span className="h-0 w-3 border-t-2 border-dashed" style={{ borderColor: CHART.target }} /> Target
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
