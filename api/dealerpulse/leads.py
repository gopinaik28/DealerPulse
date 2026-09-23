"""Lead-level serialization and the shared 'stale' predicate."""

from __future__ import annotations

from datetime import datetime

from .models import Lead
from .time_utils import days_between

DEFAULT_STALE_DAYS = 14


def days_since_activity(lead: Lead, as_of: datetime) -> float:
    return max(0.0, days_between(as_of, lead.last_activity_at))


def is_stale(lead: Lead, as_of: datetime, threshold_days: int = DEFAULT_STALE_DAYS) -> bool:
    """An open lead with no status/activity movement for ``threshold_days`` or more."""
    return lead.is_open and days_since_activity(lead, as_of) >= threshold_days


def serialize_lead(lead: Lead, as_of: datetime, threshold_days: int = DEFAULT_STALE_DAYS) -> dict:
    dsa = days_since_activity(lead, as_of)
    return {
        "id": lead.id,
        "customer_name": lead.customer_name,
        "phone": lead.phone,
        "source": lead.source,
        "model_interested": lead.model_interested,
        "status": lead.status,
        "assigned_to": lead.assigned_to,
        "branch_id": lead.branch_id,
        "deal_value": lead.deal_value,
        "created_at": lead.created_at.isoformat(),
        "last_activity_at": lead.last_activity_at.isoformat(),
        "days_since_activity": round(dsa, 1),
        "is_stale": lead.is_open and dsa >= threshold_days,
        "is_open": lead.is_open,
        "expected_close_date": lead.expected_close_date.date().isoformat()
        if lead.expected_close_date
        else None,
        "lost_reason": lead.lost_reason,
        "current_stage_note": lead.status_history[-1].note if lead.status_history else "",
        "stages_reached": [s for s in lead.stage_reached],
    }
