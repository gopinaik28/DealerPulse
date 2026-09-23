"""Parsed, indexed domain entities.

These dataclasses are the in-memory representation the aggregation layer works on.
Timestamps are parsed to aware ``datetime`` once, and a few frequently-needed
derived fields (``stage_reached``, ``is_open``) are precomputed at load time so
hot aggregation paths stay single-pass.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime

from .time_utils import parse_date, parse_ts

# Canonical funnel order. ``lost`` can branch off any stage and is tracked separately.
FUNNEL_STAGES: tuple[str, ...] = (
    "new",
    "contacted",
    "test_drive",
    "negotiation",
    "order_placed",
    "delivered",
)
OPEN_STATUSES: frozenset[str] = frozenset(
    {"new", "contacted", "test_drive", "negotiation", "order_placed"}
)
LEAD_SOURCES: tuple[str, ...] = (
    "walk_in",
    "website",
    "referral",
    "social_media",
    "phone_enquiry",
    "auto_expo",
)


@dataclass(frozen=True, slots=True)
class Branch:
    id: str
    name: str
    city: str


@dataclass(frozen=True, slots=True)
class Rep:
    id: str
    name: str
    branch_id: str
    role: str  # "branch_manager" | "sales_officer"
    joined: str


@dataclass(frozen=True, slots=True)
class Delivery:
    lead_id: str
    order_date: datetime
    delivery_date: datetime
    days_to_deliver: int
    delay_reason: str | None


@dataclass(frozen=True, slots=True)
class Target:
    branch_id: str
    month: str  # "YYYY-MM"
    target_units: int
    target_revenue: int


@dataclass(slots=True)
class StatusEvent:
    status: str
    timestamp: datetime
    note: str


@dataclass(slots=True)
class Lead:
    id: str
    customer_name: str
    phone: str
    source: str
    model_interested: str
    status: str
    assigned_to: str
    branch_id: str
    created_at: datetime
    last_activity_at: datetime
    status_history: list[StatusEvent]
    expected_close_date: datetime | None
    deal_value: int
    lost_reason: str | None

    # Derived at load time.
    stage_reached: dict[str, datetime] = field(default_factory=dict)
    delivery: Delivery | None = None
    resolved_at: datetime | None = None  # when the lead reached a terminal state (delivered/lost)

    @property
    def is_open(self) -> bool:
        """A lead still moving through the funnel (not delivered, not lost)."""
        return self.status in OPEN_STATUSES

    @property
    def is_lost(self) -> bool:
        return self.status == "lost"

    @property
    def is_delivered(self) -> bool:
        return self.status == "delivered"

    @property
    def furthest_stage_index(self) -> int:
        """Index into ``FUNNEL_STAGES`` of the furthest funnel stage this lead ever reached."""
        best = -1
        for i, stage in enumerate(FUNNEL_STAGES):
            if stage in self.stage_reached:
                best = i
        return best


def _parse_status_history(raw: list[dict]) -> list[StatusEvent]:
    events = [
        StatusEvent(status=e["status"], timestamp=parse_ts(e["timestamp"]), note=e.get("note", ""))
        for e in raw
    ]
    events.sort(key=lambda e: e.timestamp)
    return events


def build_lead(raw: dict) -> Lead:
    """Construct a :class:`Lead` from a raw JSON record, precomputing derived fields."""
    history = _parse_status_history(raw["status_history"])
    stage_reached: dict[str, datetime] = {}
    for event in history:
        # First time each status appears wins (earliest timestamp).
        stage_reached.setdefault(event.status, event.timestamp)

    expected_close = raw.get("expected_close_date")

    resolved_at: datetime | None = None
    if raw["status"] == "lost":
        resolved_at = stage_reached.get("lost") or parse_ts(raw["last_activity_at"])
    elif raw["status"] == "delivered":
        resolved_at = stage_reached.get("delivered") or parse_ts(raw["last_activity_at"])

    return Lead(
        id=raw["id"],
        customer_name=raw["customer_name"],
        phone=raw["phone"],
        source=raw["source"],
        model_interested=raw["model_interested"],
        status=raw["status"],
        assigned_to=raw["assigned_to"],
        branch_id=raw["branch_id"],
        created_at=parse_ts(raw["created_at"]),
        last_activity_at=parse_ts(raw["last_activity_at"]),
        status_history=history,
        expected_close_date=parse_date(expected_close) if expected_close else None,
        deal_value=raw["deal_value"],
        lost_reason=raw.get("lost_reason"),
        stage_reached=stage_reached,
        resolved_at=resolved_at,
    )


def build_delivery(raw: dict) -> Delivery:
    return Delivery(
        lead_id=raw["lead_id"],
        order_date=parse_date(raw["order_date"]),
        delivery_date=parse_date(raw["delivery_date"]),
        days_to_deliver=raw["days_to_deliver"],
        delay_reason=raw.get("delay_reason"),
    )
