"""Scope + period + source filtering, applied consistently across every endpoint.

A :class:`Query` captures the four dimensions the whole API understands. Helpers
here turn it into concrete lead subsets. Two date bases are deliberately kept
separate (documented in DECISIONS.md):

* **created_at basis** – lead counts, funnel, conversion. "Leads that came in
  during this period."
* **delivery_date basis** – units, revenue, attainment, days-to-deliver.
  "Cars that left the lot during this period."
"""

from __future__ import annotations

from dataclasses import dataclass

from .data import Store
from .models import Lead
from .time_utils import month_bounds


@dataclass(frozen=True, slots=True)
class Query:
    """Normalized request scope. ``month=None`` means the whole Jun-Dec window."""

    month: str | None = None
    source: str | None = None
    branch_id: str | None = None
    rep_id: str | None = None

    @property
    def is_whole_window(self) -> bool:
        return self.month is None


def _base_leads(store: Store, q: Query) -> list[Lead]:
    """Leads in scope by branch / rep, before any date or source filter."""
    if q.rep_id is not None:
        return store.leads_by_rep.get(q.rep_id, [])
    if q.branch_id is not None:
        return store.leads_by_branch.get(q.branch_id, [])
    return store.leads


def scoped_leads(store: Store, q: Query) -> list[Lead]:
    """Leads in scope by branch / rep / source. No date filter.

    Used where the metric has its own date basis (deliveries) or no date basis
    (stale leads are always evaluated as-of-now).
    """
    leads = _base_leads(store, q)
    if q.source is not None:
        leads = [l for l in leads if l.source == q.source]
    return leads


def period_leads(store: Store, q: Query) -> list[Lead]:
    """Leads in scope whose ``created_at`` falls in the selected month.

    This is the "population" for funnel, lead counts and conversion.
    """
    leads = scoped_leads(store, q)
    if q.month is None:
        return leads
    start, end = month_bounds(q.month)
    return [l for l in leads if start <= l.created_at < end]


def delivered_leads(store: Store, q: Query) -> list[Lead]:
    """Leads in scope with a delivery whose ``delivery_date`` falls in the selected month."""
    leads = scoped_leads(store, q)
    out: list[Lead] = []
    for lead in leads:
        if lead.delivery is None:
            continue
        if q.month is None:
            out.append(lead)
            continue
        start, end = month_bounds(q.month)
        if start <= lead.delivery.delivery_date < end:
            out.append(lead)
    return out


def target_months(q: Query) -> list[str] | None:
    """Months whose targets are in scope: one month, or ``None`` = all seven."""
    return None if q.month is None else [q.month]
