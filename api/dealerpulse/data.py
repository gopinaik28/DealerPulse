"""Data-loading layer: parse ``dealership_data.json`` once into an indexed store.

The store is a module-level singleton built lazily on first access. Everything the
aggregation layer needs is pre-indexed here (by branch, by rep, by lead id,
by ``(branch, month)``) so downstream calculations never re-scan the full dataset
to find a subset, and never re-parse JSON per request.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from datetime import datetime
from functools import cached_property
from pathlib import Path

from .models import (
    Branch,
    Delivery,
    Lead,
    Rep,
    Target,
    build_delivery,
    build_lead,
)
from .time_utils import month_of

_DATA_FILENAME = "dealership_data.json"


def _resolve_data_path() -> Path:
    """Locate the dataset. Explicit env var wins, then repo root, then bundled copy."""
    env = os.environ.get("DEALERPULSE_DATA")
    if env:
        return Path(env)
    here = Path(__file__).resolve()
    candidates = [
        here.parent.parent.parent / _DATA_FILENAME,  # <repo>/dealership_data.json
        here.parent.parent / _DATA_FILENAME,  # <repo>/api/dealership_data.json (Vercel bundle)
        here.parent / _DATA_FILENAME,
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    raise FileNotFoundError(
        f"Could not find {_DATA_FILENAME}; set DEALERPULSE_DATA or place it at repo root."
    )


@dataclass
class Store:
    """Immutable-after-load, fully indexed view of the dataset."""

    generated_at: str
    as_of: datetime
    branches: dict[str, Branch]
    reps: dict[str, Rep]
    leads: list[Lead]
    deliveries: list[Delivery]
    targets: list[Target]

    leads_by_id: dict[str, Lead] = field(default_factory=dict)
    leads_by_branch: dict[str, list[Lead]] = field(default_factory=dict)
    leads_by_rep: dict[str, list[Lead]] = field(default_factory=dict)
    reps_by_branch: dict[str, list[Rep]] = field(default_factory=dict)
    targets_by_branch_month: dict[tuple[str, str], Target] = field(default_factory=dict)

    @cached_property
    def branch_ids(self) -> list[str]:
        return list(self.branches.keys())

    def branch_name(self, branch_id: str) -> str:
        b = self.branches.get(branch_id)
        return b.name if b else branch_id

    def rep_name(self, rep_id: str) -> str:
        r = self.reps.get(rep_id)
        return r.name if r else rep_id


def _build_store(path: Path) -> Store:
    raw = json.loads(path.read_text())

    branches = {b["id"]: Branch(id=b["id"], name=b["name"], city=b["city"]) for b in raw["branches"]}
    reps = {
        r["id"]: Rep(
            id=r["id"],
            name=r["name"],
            branch_id=r["branch_id"],
            role=r["role"],
            joined=r["joined"],
        )
        for r in raw["sales_reps"]
    }
    leads = [build_lead(l) for l in raw["leads"]]
    deliveries = [build_delivery(d) for d in raw["deliveries"]]
    targets = [
        Target(
            branch_id=t["branch_id"],
            month=t["month"],
            target_units=t["target_units"],
            target_revenue=t["target_revenue"],
        )
        for t in raw["targets"]
    ]

    deliveries_by_lead = {d.lead_id: d for d in deliveries}

    leads_by_id: dict[str, Lead] = {}
    leads_by_branch: dict[str, list[Lead]] = {bid: [] for bid in branches}
    leads_by_rep: dict[str, list[Lead]] = {rid: [] for rid in reps}
    for lead in leads:
        lead.delivery = deliveries_by_lead.get(lead.id)
        leads_by_id[lead.id] = lead
        leads_by_branch.setdefault(lead.branch_id, []).append(lead)
        leads_by_rep.setdefault(lead.assigned_to, []).append(lead)

    reps_by_branch: dict[str, list[Rep]] = {bid: [] for bid in branches}
    for rep in reps.values():
        reps_by_branch.setdefault(rep.branch_id, []).append(rep)
    for rep_list in reps_by_branch.values():
        # Branch manager first, then officers alphabetically – stable ordering for the UI.
        rep_list.sort(key=lambda r: (r.role != "branch_manager", r.name))

    targets_by_branch_month = {(t.branch_id, t.month): t for t in targets}

    # The fixed dataset clock: the latest timestamp anywhere in the data.
    as_of = max(
        max(
            (lead.last_activity_at for lead in leads),
            default=datetime.min,
        ),
        max(
            (event.timestamp for lead in leads for event in lead.status_history),
            default=datetime.min,
        ),
    )

    return Store(
        generated_at=raw.get("metadata", {}).get("generated_at", ""),
        as_of=as_of,
        branches=branches,
        reps=reps,
        leads=leads,
        deliveries=deliveries,
        targets=targets,
        leads_by_id=leads_by_id,
        leads_by_branch=leads_by_branch,
        leads_by_rep=leads_by_rep,
        reps_by_branch=reps_by_branch,
        targets_by_branch_month=targets_by_branch_month,
    )


_store: Store | None = None


def get_store() -> Store:
    """Return the process-wide :class:`Store`, building it on first call."""
    global _store
    if _store is None:
        _store = _build_store(_resolve_data_path())
    return _store


def reset_store() -> None:
    """Drop the cached store (used by tests / sanity scripts)."""
    global _store
    _store = None


__all__ = ["Store", "get_store", "reset_store", "month_of"]
