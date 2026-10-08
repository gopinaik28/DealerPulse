"""Org / branch / rep KPI calculations and cross-branch comparisons.

Every function is pure: it takes the :class:`Store`, a :class:`Query`, and returns
plain dicts/dataclasses ready to serialize. Route handlers do no math.
"""

from __future__ import annotations

from dataclasses import dataclass

from .data import Store
from .filters import Query, delivered_leads, period_leads, scoped_leads
from .models import Lead
from .time_utils import MONTHS, month_elapsed_fraction

# Attainment status buckets, expressed as a fraction of the *expected pace* for the
# selected period (attainment / fraction-of-period-elapsed). Thresholds documented
# in DECISIONS.md. With this dataset's aggressive targets almost everything lands
# in "critical" – that is a real finding, not a bug, and the raw numbers + bar
# lengths carry the branch-to-branch comparison.
STATUS_ON_TRACK = 0.8
STATUS_BEHIND = 0.4


def classify_status(attainment: float, pace: float) -> str:
    """Map an attainment ratio + elapsed-period fraction to on_track / behind / critical."""
    if pace <= 0:
        return "on_track"
    ratio = attainment / pace
    if ratio >= STATUS_ON_TRACK:
        return "on_track"
    if ratio >= STATUS_BEHIND:
        return "behind"
    return "critical"


def _target_totals(store: Store, q: Query, branch_ids: list[str]) -> tuple[int, int]:
    months = MONTHS if q.month is None else [q.month]
    units = 0
    revenue = 0
    for bid in branch_ids:
        for month in months:
            t = store.targets_by_branch_month.get((bid, month))
            if t:
                units += t.target_units
                revenue += t.target_revenue
    return units, revenue


def _pace_fraction(q: Query, as_of) -> float:
    """How far through the selected period we are (1.0 for the whole closed window)."""
    if q.month is None:
        return 1.0
    return month_elapsed_fraction(q.month, as_of)


@dataclass(frozen=True, slots=True)
class Kpis:
    total_leads: int
    open_leads: int
    lost_leads: int
    delivered_in_period: int
    conversion_rate: float
    units_delivered: int
    revenue_delivered: int
    avg_days_to_deliver: float | None
    avg_deal_value_delivered: float | None
    target_units: int
    target_revenue: int
    attainment_units: float
    attainment_revenue: float
    pipeline_size: int
    pipeline_value: int
    won_in_period: int = 0
    resolved_in_period: int = 0

    def as_dict(self) -> dict:
        return {
            "total_leads": self.total_leads,
            "open_leads": self.open_leads,
            "lost_leads": self.lost_leads,
            "delivered_in_period": self.delivered_in_period,
            "conversion_rate": round(self.conversion_rate, 4),
            "units_delivered": self.units_delivered,
            "revenue_delivered": self.revenue_delivered,
            "avg_days_to_deliver": round(self.avg_days_to_deliver, 1)
            if self.avg_days_to_deliver is not None
            else None,
            "avg_deal_value_delivered": round(self.avg_deal_value_delivered)
            if self.avg_deal_value_delivered is not None
            else None,
            "target_units": self.target_units,
            "target_revenue": self.target_revenue,
            "attainment_units": round(self.attainment_units, 4),
            "attainment_revenue": round(self.attainment_revenue, 4),
            "pipeline_size": self.pipeline_size,
            "pipeline_value": self.pipeline_value,
            "won_in_period": self.won_in_period,
            "resolved_in_period": self.resolved_in_period,
        }


def compute_kpis(store: Store, q: Query) -> Kpis:
    """Headline KPIs for whatever scope ``q`` describes (org, branch or rep)."""
    population = period_leads(store, q)  # created_at basis
    delivered = delivered_leads(store, q)  # delivery_date basis
    scoped = scoped_leads(store, q)  # for pipeline (open leads, any date)

    lost = [l for l in population if l.is_lost]
    delivered_in_pop = [l for l in population if l.is_delivered]
    closed = len(delivered_in_pop) + len(lost)
    conversion = (len(delivered_in_pop) / closed) if closed else 0.0

    units = len(delivered)
    revenue = sum(l.deal_value for l in delivered)
    deliver_days = [l.delivery.days_to_deliver for l in delivered if l.delivery]
    avg_days = (sum(deliver_days) / len(deliver_days)) if deliver_days else None
    avg_deal = (revenue / units) if units else None

    branch_ids = [q.branch_id] if q.branch_id else store.branch_ids
    if q.rep_id is not None:
        branch_ids = [store.reps[q.rep_id].branch_id] if q.rep_id in store.reps else []
    target_units, target_revenue = _target_totals(store, q, branch_ids)
    # Rep-level targets don't exist in the data; expose branch targets only at org/branch scope.
    if q.rep_id is not None:
        target_units, target_revenue = 0, 0

    open_leads = [l for l in scoped if l.is_open]

    return Kpis(
        total_leads=len(population),
        open_leads=len([l for l in population if l.is_open]),
        lost_leads=len(lost),
        delivered_in_period=len(delivered_in_pop),
        conversion_rate=conversion,
        units_delivered=units,
        revenue_delivered=revenue,
        avg_days_to_deliver=avg_days,
        avg_deal_value_delivered=avg_deal,
        target_units=target_units,
        target_revenue=target_revenue,
        attainment_units=(units / target_units) if target_units else 0.0,
        attainment_revenue=(revenue / target_revenue) if target_revenue else 0.0,
        pipeline_size=len(open_leads),
        pipeline_value=sum(l.deal_value for l in open_leads),
        won_in_period=len(delivered_in_pop),
        resolved_in_period=closed,
    )


def branch_comparison(store: Store, q: Query) -> list[dict]:
    """One row per branch for the selected period, worst attainment first.

    Ignores ``q.branch_id`` (this is always the org-wide comparison) but honors
    ``q.month`` and ``q.source``.
    """
    pace = _pace_fraction(q, store.as_of)
    rows: list[dict] = []
    for bid, branch in store.branches.items():
        bq = Query(month=q.month, source=q.source, branch_id=bid)
        delivered = delivered_leads(store, bq)
        pop = period_leads(store, bq)
        units = len(delivered)
        revenue = sum(l.deal_value for l in delivered)
        target_units, target_revenue = _target_totals(store, bq, [bid])
        att_units = (units / target_units) if target_units else 0.0
        att_revenue = (revenue / target_revenue) if target_revenue else 0.0
        
        won = [l for l in pop if l.is_delivered]
        lost = [l for l in pop if l.is_lost]
        closed = len(won) + len(lost)
        conv = (len(won) / closed) if closed else 0.0

        rows.append(
            {
                "branch_id": bid,
                "name": branch.name,
                "city": branch.city,
                "units_delivered": units,
                "target_units": target_units,
                "attainment_units": round(att_units, 4),
                "revenue_delivered": revenue,
                "target_revenue": target_revenue,
                "attainment_revenue": round(att_revenue, 4),
                "conversion_rate": round(conv, 4),
                "total_leads": len(pop),
                "gap_units": target_units - units,
                "status": classify_status(att_units, pace),
            }
        )
    rows.sort(key=lambda r: r["attainment_units"])
    return rows


def trend(store: Store, q: Query) -> list[dict]:
    """Month-by-month delivered vs target for the current scope (branch/source aware)."""
    branch_ids = [q.branch_id] if q.branch_id else store.branch_ids
    if q.rep_id is not None and q.rep_id in store.reps:
        branch_ids = [store.reps[q.rep_id].branch_id]

    out: list[dict] = []
    for month in MONTHS:
        mq = Query(month=month, source=q.source, branch_id=q.branch_id, rep_id=q.rep_id)
        delivered = delivered_leads(store, mq)
        units = len(delivered)
        revenue = sum(l.deal_value for l in delivered)
        t_units = 0
        t_revenue = 0
        if q.rep_id is None:
            for bid in branch_ids:
                t = store.targets_by_branch_month.get((bid, month))
                if t:
                    t_units += t.target_units
                    t_revenue += t.target_revenue
        out.append(
            {
                "month": month,
                "units_delivered": units,
                "revenue_delivered": revenue,
                "target_units": t_units,
                "target_revenue": t_revenue,
                "orders_placed": len(
                    [
                        l
                        for l in period_leads(store, Query(source=q.source, branch_id=q.branch_id, rep_id=q.rep_id))
                        if "order_placed" in l.stage_reached
                        and _in_month(l.stage_reached["order_placed"], month)
                    ]
                ),
            }
        )
    return out


def lost_reasons_breakdown(store: Store, q: Query) -> list[dict]:
    """Breakdown of lost reasons within the current query scope."""
    from collections import Counter
    leads = period_leads(store, q)
    lost = [l for l in leads if l.is_lost]
    counts = Counter(l.lost_reason or "Reason not specified" for l in lost)
    total = len(lost)
    rows = [
        {
            "reason": reason,
            "count": count,
            "pct": round(count / total, 3) if total else 0.0,
        }
        for reason, count in counts.most_common(6)
    ]
    return rows


def delivery_delays_breakdown(store: Store, q: Query) -> dict:
    """Delivery delay breakdown for delivered vehicles in scope."""
    from collections import Counter
    delivered = delivered_leads(store, q)
    total = len(delivered)
    delayed = [l for l in delivered if l.delivery and l.delivery.delay_reason]
    on_time = total - len(delayed)
    reason_counts = Counter(l.delivery.delay_reason for l in delayed if l.delivery)
    return {
        "total_delivered": total,
        "on_time_count": on_time,
        "on_time_rate": round(on_time / total, 3) if total else 0.0,
        "delayed_count": len(delayed),
        "reasons": [
            {"reason": r, "count": c, "pct": round(c / total, 3) if total else 0.0}
            for r, c in reason_counts.most_common(5)
        ],
    }


def _in_month(dt, month: str) -> bool:
    return f"{dt.year:04d}-{dt.month:02d}" == month


def source_breakdown(store: Store, q: Query) -> list[dict]:
    """Win rate per lead source for leads created in the period, best first.

    Ignores ``q.source`` (this is always the cross-source comparison) but honors
    ``q.month`` and scope. Win rate = delivered / (delivered + lost); open leads excluded.
    """
    from .models import LEAD_SOURCES

    rows: list[dict] = []
    for src in LEAD_SOURCES:
        pop = period_leads(store, Query(month=q.month, source=src, branch_id=q.branch_id, rep_id=q.rep_id))
        won = sum(1 for l in pop if l.is_delivered)
        lost = sum(1 for l in pop if l.is_lost)
        closed = won + lost
        rows.append(
            {
                "source": src,
                "total_leads": len(pop),
                "delivered": won,
                "lost": lost,
                "win_rate": round(won / closed, 4) if closed else 0.0,
            }
        )
    rows.sort(key=lambda r: r["win_rate"], reverse=True)
    return rows
