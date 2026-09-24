"use client";

import { useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { formatCrores } from "@/lib/format";

export function BranchRevenueTargetChart({ branchRows = [] }) {
  const [metric, setMetric] = useState("revenue"); // "revenue" | "units"

  const data = branchRows.map((b) => {
    // Distinct branch short name (Downtown, Highway, Lakeside, Central, Eastside)
    const shortName = b.name.replace(" Toyota", "");
    return {
      name: shortName,
      fullName: `${b.name} (${b.city})`,
      actualRevenue: Number(((b.revenue_delivered || 0) / 10000000).toFixed(2)),
      targetRevenue: Number(((b.target_revenue || 0) / 10000000).toFixed(2)),
      actualUnits: b.units_delivered || 0,
      targetUnits: b.target_units || 0,
    };
  });

  return (
    <div className="card card-pad flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-ink">
            Branch {metric === "revenue" ? "Revenue" : "Units"} vs. Monthly Target
          </h3>
          <p className="text-xs text-ink-soft">
            Performance comparison across all 5 regional locations
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-line bg-canvas p-0.5 text-xs">
          <button
            onClick={() => setMetric("revenue")}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
              metric === "revenue"
                ? "bg-surface font-semibold text-ink shadow-sm"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            In Crores (₹)
          </button>
          <button
            onClick={() => setMetric("units")}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
              metric === "units"
                ? "bg-surface font-semibold text-ink shadow-sm"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            Vehicles
          </button>
        </div>
      </div>

      <div className="my-3 h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" stroke="#8B949E" fontSize={11} tickLine={false} />
            <YAxis stroke="#8B949E" fontSize={11} tickLine={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-lg border border-line bg-surface p-2.5 shadow-pop text-xs">
                    <p className="font-semibold text-ink">{d.fullName}</p>
                    <div className="mt-1 space-y-1">
                      <p className="text-accent font-medium">
                        Actual: {metric === "revenue" ? `₹${d.actualRevenue} Cr` : `${d.actualUnits} units`}
                      </p>
                      <p className="text-ink-soft">
                        Target: {metric === "revenue" ? `₹${d.targetRevenue} Cr` : `${d.targetUnits} units`}
                      </p>
                    </div>
                  </div>
                );
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={30}
              iconSize={10}
              formatter={(value) => (
                <span className="text-[11px] text-ink-soft">
                  {value === "actual" ? "Actual Delivered" : "Target Quota"}
                </span>
              )}
            />
            <Bar
              name="actual"
              dataKey={metric === "revenue" ? "actualRevenue" : "actualUnits"}
              fill="#2563EB"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              name="target"
              dataKey={metric === "revenue" ? "targetRevenue" : "targetUnits"}
              fill="#D5CFC2"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
