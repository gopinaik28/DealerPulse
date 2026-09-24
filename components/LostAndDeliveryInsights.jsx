"use client";

import { useState } from "react";
import { Card, CardHeader, SegmentedControl, Pill } from "@/components/ui";
import { inr, num, pct } from "@/lib/format";

export function LostAndDeliveryInsights({ lostReasons = [], deliveryDelays = {} }) {
  const [activeTab, setActiveTab] = useState("lost");

  const totalDelivered = deliveryDelays.total_delivered || 0;
  const onTimeRate = deliveryDelays.on_time_rate || 0;
  const delayedCount = deliveryDelays.delayed_count || 0;

  return (
    <Card>
      <CardHeader
        title={activeTab === "lost" ? "Lost deal analysis" : "Delivery logistics & delays"}
        subtitle={
          activeTab === "lost"
            ? "Primary reasons deals drop off before delivery."
            : `${num(totalDelivered)} total deliveries · ${pct(onTimeRate)} on-time fulfillment`
        }
        right={
          <SegmentedControl
            value={activeTab}
            onChange={setActiveTab}
            options={[
              { value: "lost", label: "Lost reasons" },
              { value: "delays", label: "Delivery delays" },
            ]}
          />
        }
      />

      <div className="card-pad">
        {activeTab === "lost" ? (
          <div className="space-y-3">
            {lostReasons.map((item, idx) => {
              const barWidth = Math.max(3, item.pct * 100 * 2.5); // scale
              return (
                <div key={item.reason} className="flex items-center gap-3">
                  <span className="nums w-4 text-xs text-ink-faint font-semibold">{idx + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-ink truncate max-w-[280px]">
                        {item.reason}
                      </span>
                      <span className="nums font-bold text-ink">
                        {item.count} leads <span className="text-ink-faint">({pct(item.pct)})</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/80">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300"
                        style={{ width: `${Math.min(100, barWidth)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 pb-2 border-b border-line/60">
              <div className="rounded-lg bg-surface/60 border border-line/60 p-3">
                <div className="text-[11px] font-semibold text-ink-faint uppercase">On-time rate</div>
                <div className="nums text-xl font-bold text-good mt-1">{pct(onTimeRate)}</div>
                <div className="text-xs text-ink-soft mt-0.5">{deliveryDelays.on_time_count} vehicles on schedule</div>
              </div>
              <div className="rounded-lg bg-surface/60 border border-line/60 p-3">
                <div className="text-[11px] font-semibold text-ink-faint uppercase">Delayed handoffs</div>
                <div className="nums text-xl font-bold text-warn mt-1">{delayedCount}</div>
                <div className="text-xs text-ink-soft mt-0.5">logistics or factory hold-ups</div>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                Top delay drivers
              </div>
              {(deliveryDelays.reasons || []).map((r) => (
                <div key={r.reason} className="flex items-center justify-between text-xs py-1 border-b border-line/40 last:border-0">
                  <span className="text-ink font-medium">{r.reason}</span>
                  <span className="nums font-semibold text-ink-soft bg-surface px-2 py-0.5 rounded border border-line">
                    {r.count} cases
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
