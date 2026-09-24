"""Rep-level rankings within a branch."""

from __future__ import annotations

from .data import Store
from .filters import Query, delivered_leads, period_leads, scoped_leads
from .time_utils import days_between


def rep_ranking(store: Store, q: Query) -> list[dict]:
    """Rank every rep in ``q.branch_id`` for the selected period.

    Primary sort: units delivered (desc), then conversion rate (desc). The UI shows
    all four dimensions the assignment calls out – units, conversion, avg deal
    value, pipeline size – so the ordering is a sensible default, not the whole story.
    """
    if q.branch_id is None:
        return []

    rows: list[dict] = []
    for rep in store.reps_by_branch.get(q.branch_id, []):
        rq = Query(month=q.month, source=q.source, branch_id=q.branch_id, rep_id=rep.id)
        delivered = delivered_leads(store, rq)
        population = period_leads(store, rq)
        scoped = scoped_leads(store, rq)

        lost = [l for l in population if l.is_lost]
        won = [l for l in population if l.is_delivered]
        closed = len(won) + len(lost)
        conversion = (len(won) / closed) if closed else 0.0

        units = len(delivered)
        revenue = sum(l.deal_value for l in delivered)
        open_leads = [l for l in scoped if l.is_open]

        contact_spans = [
            days_between(l.stage_reached["contacted"], l.stage_reached["new"])
            for l in scoped
            if "contacted" in l.stage_reached and "new" in l.stage_reached
        ]
        avg_time_to_contact = (
            sum(contact_spans) / len(contact_spans) if contact_spans else None
        )

        rows.append(
            {
                "rep_id": rep.id,
                "name": rep.name,
                "role": rep.role,
                "units_delivered": units,
                "revenue_delivered": revenue,
                "conversion_rate": round(conversion, 4),
                "avg_deal_value": round(revenue / units) if units else None,
                "pipeline_size": len(open_leads),
                "pipeline_value": sum(l.deal_value for l in open_leads),
                "leads_handled": len(population),
                "avg_days_to_contact": round(avg_time_to_contact, 1)
                if avg_time_to_contact is not None
                else None,
            }
        )

    rows.sort(key=lambda r: (-r["units_delivered"], -r["conversion_rate"]))
    for i, row in enumerate(rows, start=1):
        row["rank"] = i
    return rows


def rank_sales_reps(store: Store, q: Query) -> list[dict]:
    """Rank sales reps across the organization (or a single branch if q.branch_id is specified).
    
    Includes branch_id and branch_name for each rep to render group-wide leaderboards.
    """
    if q.branch_id is not None:
        reps = store.reps_by_branch.get(q.branch_id, [])
    else:
        reps = list(store.reps.values())

    rows: list[dict] = []
    for rep in reps:
        branch = store.branches.get(rep.branch_id)
        branch_name = branch.name if branch else rep.branch_id
        rq = Query(month=q.month, source=q.source, branch_id=rep.branch_id, rep_id=rep.id)
        delivered = delivered_leads(store, rq)
        population = period_leads(store, rq)
        scoped = scoped_leads(store, rq)

        lost = [l for l in population if l.is_lost]
        won = [l for l in population if l.is_delivered]
        closed = len(won) + len(lost)
        conversion = (len(won) / closed) if closed else 0.0

        units = len(delivered)
        revenue = sum(l.deal_value for l in delivered)
        open_leads = [l for l in scoped if l.is_open]

        rows.append(
            {
                "rep_id": rep.id,
                "name": rep.name,
                "role": rep.role,
                "branch_id": rep.branch_id,
                "branch_name": branch_name,
                "units_delivered": units,
                "revenue_delivered": revenue,
                "conversion_rate": round(conversion, 4),
                "avg_deal_value": round(revenue / units) if units else 0,
                "pipeline_size": len(open_leads),
                "pipeline_value": sum(l.deal_value for l in open_leads),
                "leads_handled": len(population),
            }
        )

    rows.sort(key=lambda r: (-r["units_delivered"], -r["revenue_delivered"], -r["conversion_rate"]))
    for i, row in enumerate(rows, start=1):
        row["rank"] = i
    return rows

