"""The "Needs Attention" panel: everything a manager could act on *today*.

Four insight families, all computed live from the data:

1. ``stale_leads``   – open leads with no movement for N+ days, grouped by branch/rep.
2. ``target_risk``   – branches tracking to miss the selected month's target.
3. ``funnel_dropoff``– which stage leaks the most, sliced by branch and by source
                        (the open-ended pick – rationale in DECISIONS.md).
4. ``branch_summaries`` – one plain-English paragraph per branch, templated from
                        the numbers above (no LLM, zero external deps).
"""

from __future__ import annotations

from collections import defaultdict

from .data import Store
from .filters import Query, delivered_leads, period_leads, scoped_leads
from .funnel import funnel_stats, worst_transition
from .leads import DEFAULT_STALE_DAYS, days_since_activity, is_stale
from .metrics import _target_totals
from .models import FUNNEL_STAGES, LEAD_SOURCES
from .time_utils import (
    MONTHS,
    month_elapsed_fraction,
    days_remaining_in_month,
)

STAGE_LABELS = {
    "new": "New",
    "contacted": "Contacted",
    "test_drive": "Test drive",
    "negotiation": "Negotiation",
    "order_placed": "Order placed",
    "delivered": "Delivered",
}


def _fmt_inr(amount: float) -> str:
    """Indian-format a rupee amount as ₹X.XCr / ₹X.XL."""
    if amount >= 1_00_00_000:
        return f"₹{amount / 1_00_00_000:.1f}Cr"
    if amount >= 1_00_000:
        return f"₹{amount / 1_00_000:.1f}L"
    return f"₹{amount:,.0f}"


# --------------------------------------------------------------------------- #
# 1. Stale leads
# --------------------------------------------------------------------------- #
def stale_leads(store: Store, q: Query, threshold_days: int = DEFAULT_STALE_DAYS) -> dict:
    """Open leads with no activity for ``threshold_days``+, grouped by branch and rep.

    Always evaluated as-of the dataset clock, regardless of the selected month –
    a lead that went cold in July is still cold in December.
    """
    candidates = [l for l in scoped_leads(store, q) if is_stale(l, store.as_of, threshold_days)]

    by_branch: dict[str, dict] = {}
    by_rep: dict[str, dict] = {}
    for lead in candidates:
        b = by_branch.setdefault(
            lead.branch_id,
            {
                "branch_id": lead.branch_id,
                "name": store.branch_name(lead.branch_id),
                "count": 0,
                "value_at_risk": 0,
            },
        )
        b["count"] += 1
        b["value_at_risk"] += lead.deal_value

        r = by_rep.setdefault(
            lead.assigned_to,
            {
                "rep_id": lead.assigned_to,
                "name": store.rep_name(lead.assigned_to),
                "branch": store.branch_name(lead.branch_id),
                "count": 0,
                "value_at_risk": 0,
            },
        )
        r["count"] += 1
        r["value_at_risk"] += lead.deal_value

    oldest = None
    if candidates:
        o = max(candidates, key=lambda l: days_since_activity(l, store.as_of))
        oldest = {
            "lead_id": o.id,
            "customer_name": o.customer_name,
            "rep": store.rep_name(o.assigned_to),
            "branch": store.branch_name(o.branch_id),
            "status": o.status,
            "model_interested": o.model_interested,
            "days_since_activity": round(days_since_activity(o, store.as_of), 1),
            "deal_value": o.deal_value,
        }

    return {
        "threshold_days": threshold_days,
        "total": len(candidates),
        "value_at_risk": sum(l.deal_value for l in candidates),
        "by_branch": sorted(by_branch.values(), key=lambda x: -x["count"]),
        "by_rep": sorted(by_rep.values(), key=lambda x: -x["count"])[:8],
        "oldest": oldest,
    }


# --------------------------------------------------------------------------- #
# 2. Target risk
# --------------------------------------------------------------------------- #
def _risk_month(q: Query) -> str:
    """Which month to pace against: the selected one, or December for the whole window."""
    return q.month or MONTHS[-1]


def target_risk(store: Store, q: Query) -> dict:
    """Per-branch pacing verdict for the risk month.

    ``projected`` extrapolates current attainment to month-end using elapsed days.
    For a month that is already over (true for December at the dataset clock) the
    projection equals the actual and the verdict is final.
    """
    month = _risk_month(q)
    elapsed = month_elapsed_fraction(month, store.as_of)
    days_left = days_remaining_in_month(month, store.as_of)
    month_over = elapsed >= 1.0

    branches = []
    for bid, branch in store.branches.items():
        bq = Query(month=month, source=q.source, branch_id=bid)
        units = len(delivered_leads(store, bq))
        target_units, target_revenue = _target_totals(store, bq, [bid])
        attainment = (units / target_units) if target_units else 0.0
        projected_attainment = attainment if (month_over or elapsed <= 0) else attainment / elapsed
        projected_units = round(units if month_over else (units / elapsed if elapsed > 0 else 0))

        if projected_attainment >= 1.0:
            verdict = "on_track"
        elif projected_attainment >= 0.8:
            verdict = "at_risk"
        else:
            verdict = "will_miss"

        branches.append(
            {
                "branch_id": bid,
                "name": branch.name,
                "month": month,
                "units_delivered": units,
                "target_units": target_units,
                "attainment_units": round(attainment, 4),
                "projected_units": projected_units,
                "projected_attainment": round(projected_attainment, 4),
                "gap_units": max(0, target_units - units),
                "verdict": verdict,
            }
        )

    branches.sort(key=lambda b: b["projected_attainment"])
    return {
        "month": month,
        "month_over": month_over,
        "pct_month_elapsed": round(elapsed, 4),
        "days_remaining": days_left,
        "branches": branches,
        "at_risk_count": sum(1 for b in branches if b["verdict"] != "on_track"),
    }


# --------------------------------------------------------------------------- #
# 3. Funnel drop-off  (the open-ended pick)
# --------------------------------------------------------------------------- #
def funnel_dropoff(store: Store, q: Query) -> dict:
    """Where leads leak, org-wide, per branch, and per source."""
    org_stats = funnel_stats(period_leads(store, q))
    org_worst = worst_transition(org_stats)

    by_branch = []
    for bid, branch in store.branches.items():
        bstats = funnel_stats(period_leads(store, Query(month=q.month, source=q.source, branch_id=bid)))
        wt = worst_transition(bstats)
        if wt:
            by_branch.append(
                {
                    "branch_id": bid,
                    "name": branch.name,
                    "from": wt["from"],
                    "to": wt["to"],
                    "drop_pct": round(wt["drop_pct"], 4),
                    "drop_count": wt["drop_count"],
                }
            )
    by_branch.sort(key=lambda x: -x["drop_pct"])

    by_source = []
    for source in LEAD_SOURCES:
        sq = Query(month=q.month, source=source, branch_id=q.branch_id)
        pop = period_leads(store, sq)
        if not pop:
            continue
        sstats = funnel_stats(pop)
        wt = worst_transition(sstats)
        won = sum(1 for l in pop if l.is_delivered)
        lost = sum(1 for l in pop if l.is_lost)
        closed = won + lost
        by_source.append(
            {
                "source": source,
                "leads": len(pop),
                "conversion_rate": round(won / closed, 4) if closed else 0.0,
                "delivered": won,
                "worst_from": wt["from"] if wt else None,
                "worst_to": wt["to"] if wt else None,
                "worst_drop_pct": round(wt["drop_pct"], 4) if wt else None,
            }
        )
    by_source.sort(key=lambda x: x["conversion_rate"])

    return {
        "org_stages": [
            {
                "from": s.stage,
                "to": FUNNEL_STAGES[i + 1],
                "reached": s.reached,
                "advanced": s.advanced,
                "drop_count": s.drop_count,
                "drop_pct": round(s.drop_pct, 4),
            }
            for i, s in enumerate(org_stats)
            if i + 1 < len(FUNNEL_STAGES)
        ],
        "org_worst": org_worst,
        "by_branch": by_branch,
        "by_source": by_source,
    }


# --------------------------------------------------------------------------- #
# 4. Plain-English branch summaries
# --------------------------------------------------------------------------- #
def branch_summaries(store: Store, q: Query, threshold_days: int = DEFAULT_STALE_DAYS) -> list[dict]:
    """One templated paragraph per branch, ordered worst attainment first."""
    month = _risk_month(q)
    month_label = _month_label(month)
    elapsed = month_elapsed_fraction(month, store.as_of)
    days_left = days_remaining_in_month(month, store.as_of)

    out = []
    for bid, branch in store.branches.items():
        bq = Query(month=q.month, source=q.source, branch_id=bid)
        risk_bq = Query(month=month, source=q.source, branch_id=bid)

        units_period = len(delivered_leads(store, bq))
        t_units, _ = _target_totals(store, bq, [bid])
        att = (units_period / t_units) if t_units else 0.0

        risk_units = len(delivered_leads(store, risk_bq))
        rt_units, _ = _target_totals(store, risk_bq, [bid])
        risk_att = (risk_units / rt_units) if rt_units else 0.0

        stats = funnel_stats(period_leads(store, bq))
        wt = worst_transition(stats)

        stale = [l for l in scoped_leads(store, Query(branch_id=bid, source=q.source)) if is_stale(l, store.as_of, threshold_days)]
        stale_value = sum(l.deal_value for l in stale)

        behind_pct = round((1 - risk_att) * 100)
        pace_clause = (
            f"the {month_label} target with the month closed out"
            if elapsed >= 1.0
            else f"its {month_label} target with {days_left} day{'s' if days_left != 1 else ''} left"
        )
        parts = [
            f"{branch.name} is {behind_pct}% behind {pace_clause} "
            f"({risk_units} of {rt_units} units)."
        ]
        if q.month is None and month != MONTHS[-1]:
            parts.append(f"For the full window it has delivered {units_period} of {t_units} ({att:.0%}).")
        if wt:
            parts.append(
                f"Biggest funnel leak: {STAGE_LABELS[wt['from']].lower()} → "
                f"{STAGE_LABELS[wt['to']].lower()} (loses {wt['drop_pct']:.0%} of leads that get there)."
            )
        if stale:
            parts.append(
                f"{len(stale)} open lead{'s' if len(stale) != 1 else ''} "
                f"({_fmt_inr(stale_value)}) have had no activity in {threshold_days}+ days."
            )
        out.append(
            {
                "branch_id": bid,
                "name": branch.name,
                "attainment_units": round(risk_att, 4),
                "text": " ".join(parts),
            }
        )
    out.sort(key=lambda x: x["attainment_units"])
    return out


def _month_label(month: str) -> str:
    names = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ]
    _, m = month.split("-")
    return names[int(m) - 1]


# --------------------------------------------------------------------------- #
# Assembled panel
# --------------------------------------------------------------------------- #
def insights_panel(store: Store, q: Query, threshold_days: int = DEFAULT_STALE_DAYS) -> dict:
    return {
        "as_of": store.as_of.isoformat(),
        "scope": {
            "level": "branch" if q.branch_id else "org",
            "branch_id": q.branch_id,
            "month": q.month or "all",
            "source": q.source,
        },
        "stale_leads": stale_leads(store, q, threshold_days),
        "target_risk": target_risk(store, q),
        "funnel_dropoff": funnel_dropoff(store, q),
        "branch_summaries": branch_summaries(store, q, threshold_days),
    }
