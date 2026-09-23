"""Sanity-check the aggregation layer against figures computed straight from the raw JSON.

Run:  python scripts/sanity.py
Exits non-zero if any headline number drifts from an independent recount.
"""

from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "api"))

from dealerpulse.data import get_store  # noqa: E402
from dealerpulse.filters import Query  # noqa: E402
from dealerpulse.funnel import funnel_stats  # noqa: E402
from dealerpulse.insights import insights_panel  # noqa: E402
from dealerpulse.metrics import branch_comparison, compute_kpis, trend  # noqa: E402

RAW = json.loads((ROOT / "dealership_data.json").read_text())

failures: list[str] = []


def check(label: str, got, expected) -> None:
    ok = got == expected
    if not ok and isinstance(got, float):
        ok = abs(got - expected) < 1e-6
    status = "OK " if ok else "FAIL"
    print(f"[{status}] {label}: got={got!r} expected={expected!r}")
    if not ok:
        failures.append(label)


store = get_store()

# --- fixed clock -----------------------------------------------------------
all_ts = [l["last_activity_at"] for l in RAW["leads"]]
for l in RAW["leads"]:
    all_ts += [h["timestamp"] for h in l["status_history"]]
check("as_of == max timestamp", store.as_of.isoformat().replace("+00:00", "Z"),
      max(all_ts).replace("Z", "") + "Z" if not max(all_ts).endswith("Z") else max(all_ts))

# --- org KPIs, whole window ---------------------------------------------------
k = compute_kpis(store, Query())
delivered_ids = {d["lead_id"] for d in RAW["deliveries"]}
by_id = {l["id"]: l for l in RAW["leads"]}
check("total leads", k.total_leads, len(RAW["leads"]))
check("units delivered (all)", k.units_delivered, len(RAW["deliveries"]))
check("revenue delivered (all)", k.revenue_delivered,
      sum(by_id[i]["deal_value"] for i in delivered_ids))
status_counts = Counter(l["status"] for l in RAW["leads"])
check("lost leads", k.lost_leads, status_counts["lost"])
won = status_counts["delivered"]
lost = status_counts["lost"]
check("conversion rate (all)", round(k.conversion_rate, 6), round(won / (won + lost), 6))
check("target units total", k.target_units, sum(t["target_units"] for t in RAW["targets"]))

# --- funnel ----------------------------------------------------------------
stats = {s.stage: s.reached for s in funnel_stats(store.leads)}
order = ["new", "contacted", "test_drive", "negotiation", "order_placed", "delivered"]
reached_raw = Counter()
for l in RAW["leads"]:
    seen = {h["status"] for h in l["status_history"]}
    for s in order:
        if s in seen:
            reached_raw[s] += 1
for s in order:
    check(f"funnel reached {s}", stats[s], reached_raw[s])

# --- branch comparison ---------------------------------------------------------
bc = {b["branch_id"]: b for b in branch_comparison(store, Query())}
tu = Counter()
du = Counter()
for t in RAW["targets"]:
    tu[t["branch_id"]] += t["target_units"]
for d in RAW["deliveries"]:
    du[by_id[d["lead_id"]]["branch_id"]] += 1
for bid in tu:
    check(f"{bid} units delivered", bc[bid]["units_delivered"], du[bid])
    check(f"{bid} attainment_units", round(bc[bid]["attainment_units"], 4),
          round(du[bid] / tu[bid], 4))
worst = branch_comparison(store, Query())[0]
check("worst branch is B3 Lakeside", worst["branch_id"], "B3")

# --- trend sums back to totals ----------------------------------------------
tr = trend(store, Query())
check("trend units sum == 160", sum(r["units_delivered"] for r in tr), 160)
check("trend months", [r["month"] for r in tr],
      ["2025-06", "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12"])

# --- December scope ------------------------------------------------------------
kd = compute_kpis(store, Query(month="2025-12"))
dec_deliv = sum(1 for d in RAW["deliveries"] if d["delivery_date"][:7] == "2025-12")
check("Dec units delivered", kd.units_delivered, dec_deliv)

# --- insights smoke ----------------------------------------------------------
panel = insights_panel(store, Query())
assert panel["stale_leads"]["total"] > 0, "expected some stale leads"
assert panel["target_risk"]["branches"], "expected target risk rows"
assert len(panel["branch_summaries"]) == 5, "expected 5 branch summaries"
print("\nStale leads (14d):", panel["stale_leads"]["total"],
      "| value at risk:", panel["stale_leads"]["value_at_risk"])
print("Org worst funnel step:", panel["funnel_dropoff"]["org_worst"])
print("Sample summary:", panel["branch_summaries"][0]["text"])

print()
if failures:
    print(f"{len(failures)} CHECK(S) FAILED: {failures}")
    sys.exit(1)
print("All sanity checks passed.")
