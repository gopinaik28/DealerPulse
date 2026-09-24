"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { formatLakhs, formatPct } from "@/lib/format";

export function SalesLeaderboard({ reps = [] }) {
  // Sort state: default by deals closed descending
  const [sortKey, setSortKey] = useState("deals");
  const [sortDir, setSortDir] = useState("desc");

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortedReps = useMemo(() => {
    const list = [...reps];
    return list.sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortKey === "deals") {
        valA = a.units_delivered || 0;
        valB = b.units_delivered || 0;
      } else if (sortKey === "revenue") {
        valA = a.revenue_delivered || 0;
        valB = b.revenue_delivered || 0;
      } else if (sortKey === "winrate") {
        valA = a.conversion_rate || 0;
        valB = b.conversion_rate || 0;
      } else if (sortKey === "avgdeal") {
        valA = a.units_delivered ? a.revenue_delivered / a.units_delivered : 0;
        valB = b.units_delivered ? b.revenue_delivered / b.units_delivered : 0;
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [reps, sortKey, sortDir]);

  const renderSortIndicator = (key) => {
    if (sortKey !== key) {
      return (
        <span className="inline-block ml-1 opacity-30 text-[10px]">↕</span>
      );
    }
    return (
      <span className="inline-block ml-1 font-bold text-accent text-[11px]">
        {sortDir === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          Sales Representative Leaderboard
        </h2>
        <p className="text-xs text-ink-soft">
          Individual performance tracking across quota-carrying sales officers in all branches (click headers to sort)
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-canvas/60 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
              <tr>
                <th className="px-5 py-3">Rank & Name</th>
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3">Role</th>
                <th
                  onClick={() => handleSort("deals")}
                  className="px-4 py-3 text-right cursor-pointer select-none hover:bg-card-hover hover:text-ink transition-colors"
                >
                  Deals Closed {renderSortIndicator("deals")}
                </th>
                <th className="px-4 py-3 text-right">
                  Target Gap (Deficit)
                </th>
                <th
                  onClick={() => handleSort("revenue")}
                  className="px-4 py-3 text-right cursor-pointer select-none hover:bg-card-hover hover:text-ink transition-colors"
                >
                  Revenue Generated {renderSortIndicator("revenue")}
                </th>
                <th
                  onClick={() => handleSort("winrate")}
                  className="px-4 py-3 text-right cursor-pointer select-none hover:bg-card-hover hover:text-ink transition-colors"
                >
                  Win Rate {renderSortIndicator("winrate")}
                </th>
                <th
                  onClick={() => handleSort("avgdeal")}
                  className="px-5 py-3 text-right cursor-pointer select-none hover:bg-card-hover hover:text-ink transition-colors"
                >
                  Avg Deal Value {renderSortIndicator("avgdeal")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {sortedReps.map((r, idx) => {
                const rankBadgeClass =
                  idx === 0
                    ? "bg-amber-400 text-zinc-950 font-extrabold shadow-sm"
                    : idx === 1
                    ? "bg-zinc-700 text-white font-bold"
                    : idx === 2
                    ? "bg-amber-700/80 text-white font-bold"
                    : "border border-line bg-canvas/80 text-ink-soft";

                const avgDeal = r.units_delivered
                  ? formatLakhs(r.revenue_delivered / r.units_delivered)
                  : "—";

                return (
                  <tr key={r.rep_id} className="transition-colors hover:bg-card-hover">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${rankBadgeClass}`}
                        >
                          {idx + 1}
                        </span>
                        <Link
                          href={`/branches/${r.branch_id}/reps/${r.rep_id}`}
                          className="font-semibold text-ink hover:text-accent hover:underline"
                        >
                          {r.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-ink-soft">
                      {r.branch_name}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full border border-line bg-canvas px-2 py-0.5 text-[10px] font-medium text-ink-soft">
                        Sales Officer
                      </span>
                    </td>
                    <td className="nums px-4 py-3.5 text-right font-semibold text-accent">
                      {r.units_delivered} units
                    </td>
                    <td className="nums px-4 py-3.5 text-right font-medium text-warn">
                      {r.units_delivered < 10 ? `-${10 - r.units_delivered} units` : "On Track"}
                    </td>
                    <td className="nums px-4 py-3.5 text-right font-semibold text-good">
                      {formatLakhs(r.revenue_delivered)}
                    </td>
                    <td className="nums px-4 py-3.5 text-right font-medium text-ink">
                      {formatPct(r.conversion_rate)}
                    </td>
                    <td className="nums px-5 py-3.5 text-right font-medium text-ink-soft">
                      {avgDeal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
