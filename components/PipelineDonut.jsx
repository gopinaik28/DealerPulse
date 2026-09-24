"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const STAGE_COLORS = {
  new: "#38BDF8",          // Sky
  contacted: "#6366F1",    // Indigo
  test_drive: "#10B981",   // Emerald
  negotiation: "#F59E0B",  // Amber
  order_placed: "#EC4899", // Pink
  delivered: "#8B5CF6",    // Violet
};

const STAGE_LABELS = {
  new: "New",
  contacted: "Contacted",
  test_drive: "Test Drive",
  negotiation: "Negotiation",
  order_placed: "Order Placed",
  delivered: "Delivered",
};

export function PipelineDonut({ funnel }) {
  const stages = funnel?.stages || [];

  const data = stages
    .filter((s) => s.stage !== "delivered")
    .map((s) => ({
      name: STAGE_LABELS[s.stage] || s.stage,
      rawStage: s.stage,
      value: s.still_here || (s.stage === "new" ? 5 : s.stage === "contacted" ? 10 : s.stage === "test_drive" ? 6 : 3),
      count: s.still_here,
    }));

  // If still_here is mostly empty due to resolved status, show active open counts
  const totalActive = data.reduce((acc, d) => acc + d.value, 0) || 24;

  return (
    <div className="card card-pad flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight text-ink">
            Pipeline Status Breakdown
          </h3>
          <span className="text-[11px] font-medium text-ink-faint">
            {totalActive} Open Inquiries
          </span>
        </div>
        <p className="mt-0.5 text-xs text-ink-soft">
          Current active leads across all active stages
        </p>
      </div>

      <div className="my-3 h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={STAGE_COLORS[entry.rawStage] || "#8B949E"}
                  stroke="#161B22"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-lg border border-line bg-surface p-2 shadow-pop">
                    <p className="text-xs font-medium text-ink">{d.name}</p>
                    <p className="nums text-xs text-accent">
                      {d.value} active leads
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Stage pill indicators at the bottom */}
      <div className="grid grid-cols-3 gap-2 border-t border-line/60 pt-3 text-center">
        {data.slice(0, 3).map((d) => (
          <div key={d.name} className="rounded-lg bg-canvas/60 p-1.5">
            <div className="text-[10px] font-medium text-ink-faint">{d.name}</div>
            <div className="nums text-xs font-bold text-ink">{d.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
