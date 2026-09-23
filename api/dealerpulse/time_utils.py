"""Time helpers for the fixed dataset clock.

The dataset ends on 2025-12-31; there is no live feed. Every "days since" / "days
remaining" calculation is anchored to the latest timestamp present in the data
(``AS_OF``), which the data layer computes once at load time and callers pass in.
This module only holds pure, side-effect-free helpers.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

# The 7 months the dataset spans (targets exist for exactly these).
MONTHS: list[str] = [
    "2025-06",
    "2025-07",
    "2025-08",
    "2025-09",
    "2025-10",
    "2025-11",
    "2025-12",
]

WINDOW_START = "2025-06"
WINDOW_END = "2025-12"


def parse_ts(value: str) -> datetime:
    """Parse an ISO-8601 timestamp (with ``Z`` or explicit offset) to an aware UTC datetime."""
    dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def parse_date(value: str) -> datetime:
    """Parse a ``YYYY-MM-DD`` date to an aware UTC datetime at midnight."""
    return datetime.fromisoformat(value).replace(tzinfo=timezone.utc)


def month_of(dt: datetime) -> str:
    """Return the ``YYYY-MM`` bucket for a datetime."""
    return f"{dt.year:04d}-{dt.month:02d}"


def month_bounds(month: str) -> tuple[datetime, datetime]:
    """Return ``[start, end)`` UTC datetimes for a ``YYYY-MM`` month string."""
    year, mon = (int(x) for x in month.split("-"))
    start = datetime(year, mon, 1, tzinfo=timezone.utc)
    if mon == 12:
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end = datetime(year, mon + 1, 1, tzinfo=timezone.utc)
    return start, end


def days_in_month(month: str) -> int:
    """Number of calendar days in a ``YYYY-MM`` month."""
    start, end = month_bounds(month)
    return (end - start).days


def normalize_month(month: str | None) -> str | None:
    """Map a raw query value to a concrete month, ``None`` (= whole window), or raise nothing.

    ``None``, ``""`` and ``"all"`` all mean "the entire June-December 2025 window".
    Any other value is returned as-is (validated by the caller against ``MONTHS``).
    """
    if month is None or month == "" or month.lower() == "all":
        return None
    return month


def month_elapsed_fraction(month: str, as_of: datetime) -> float:
    """Fraction of ``month`` that has elapsed as of ``as_of`` (0.0 future .. 1.0 fully past)."""
    start, end = month_bounds(month)
    if as_of >= end:
        return 1.0
    if as_of <= start:
        return 0.0
    return (as_of - start) / (end - start)


def days_remaining_in_month(month: str, as_of: datetime) -> int:
    """Whole days left in ``month`` after ``as_of`` (0 if the month is over)."""
    _, end = month_bounds(month)
    if as_of >= end:
        return 0
    return max(0, (end - as_of).days)


def days_between(later: datetime, earlier: datetime) -> float:
    """Fractional days between two datetimes (``later - earlier``)."""
    return (later - earlier) / timedelta(days=1)
