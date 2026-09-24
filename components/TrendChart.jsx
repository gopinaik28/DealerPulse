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
                cursor={{ fill: "rgba(56, 189, 248, 0.05)" }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-line bg-card/95 backdrop-blur-md px-3.5 py-2.5 text-xs shadow-xl">
                      <div className="font-semibold text-ink border-b border-line pb-1.5 mb-1.5">{monthLabel(row.month)}</div>
                      <div className="flex items-center justify-between gap-6 py-0.5">
                        <span className="text-ink-soft">Delivered</span>
                        <span className="nums font-bold text-accent">{fmt(row[actualKey])}</span>
                      </div>
                      {showTarget && (
                        <div className="flex items-center justify-between gap-6 py-0.5">
                          <span className="text-ink-soft">Target</span>
                          <span className="nums font-medium text-ink-soft">{fmt(row[targetKey])}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-6 py-0.5">
                        <span className="text-ink-soft">Orders placed</span>
                        <span className="nums font-medium text-ink-soft">{num(row.orders_placed)}</span>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey={actualKey} fill={CHART.actual} radius={[4, 4, 0, 0]} maxBarSize={36} />
              {showTarget && (
                <Line
                  type="monotone"
                  dataKey={targetKey}
                  stroke={CHART.target}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: CHART.target }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-line/50 pt-3 text-[11px] text-ink-faint">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-accent" /> Delivered Actuals
          </span>
          {showTarget && (
            <span className="flex items-center gap-1.5">
              <span className="h-0 w-3.5 border-t-2 border-dashed border-ink-faint" /> Target
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
