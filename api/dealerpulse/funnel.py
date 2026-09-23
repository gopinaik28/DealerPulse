"""Conversion-funnel math driven by each lead's ``status_history`` audit trail.

Two views of the same leads:

* **Stage reached** – how many leads *ever* touched each stage (the classic funnel).
* **Drop-off** – of the leads that reached stage N, how many advanced vs were lost
  vs are still sitting there. This is what the "Needs Attention" panel acts on.
"""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass

from .models import FUNNEL_STAGES, Lead
from .time_utils import days_between


@dataclass(frozen=True, slots=True)
class StageStat:
    stage: str
    reached: int  # leads that ever reached this stage
    advanced: int  # ... that also reached the next stage
    lost_here: int  # currently-lost leads whose furthest stage is this one
    still_here: int  # open leads currently parked at this stage
    drop_count: int  # reached - advanced (left the funnel or stalled here)
    drop_pct: float  # drop_count / reached
    avg_days_in_stage: float | None  # mean time from entering this stage to the next


def _avg_days_in_stage(leads: list[Lead], stage: str, next_stage: str) -> float | None:
    spans: list[float] = []
    for lead in leads:
        a = lead.stage_reached.get(stage)
        b = lead.stage_reached.get(next_stage)
        if a and b and b >= a:
            spans.append(days_between(b, a))
    if not spans:
        return None
    return sum(spans) / len(spans)


def funnel_stats(leads: list[Lead]) -> list[StageStat]:
    """Compute per-stage reach and drop-off for a lead population. Single pass + light post-processing."""
    reached = Counter()
    for lead in leads:
        for stage in FUNNEL_STAGES:
            if stage in lead.stage_reached:
                reached[stage] += 1

    lost_by_furthest = Counter()
    open_by_current = Counter()
    for lead in leads:
        if lead.is_lost:
            idx = lead.furthest_stage_index
            if idx >= 0:
                lost_by_furthest[FUNNEL_STAGES[idx]] += 1
        elif lead.is_open:
            open_by_current[lead.status] += 1

    stats: list[StageStat] = []
    for i, stage in enumerate(FUNNEL_STAGES):
        nxt = FUNNEL_STAGES[i + 1] if i + 1 < len(FUNNEL_STAGES) else None
        r = reached[stage]
        adv = reached[nxt] if nxt else 0
        drop = max(0, r - adv) if nxt else 0
        stats.append(
            StageStat(
                stage=stage,
                reached=r,
                advanced=adv if nxt else 0,
                lost_here=lost_by_furthest[stage],
                still_here=open_by_current[stage],
                drop_count=drop,
                drop_pct=(drop / r) if (nxt and r) else 0.0,
                avg_days_in_stage=_avg_days_in_stage(leads, stage, nxt) if nxt else None,
            )
        )
    return stats


def worst_transition(stats: list[StageStat]) -> dict | None:
    """The stage-to-stage step that loses the largest share of the leads that reached it.

    Ignores steps with a tiny base (< 5 leads reached) so a 1-of-2 blip can't win.
    """
    candidates = [
        s
        for s in stats
        if s.stage != FUNNEL_STAGES[-1] and s.reached >= 5 and s.drop_pct > 0
    ]
    if not candidates:
        return None
    worst = max(candidates, key=lambda s: s.drop_pct)
    idx = FUNNEL_STAGES.index(worst.stage)
    return {
        "from": worst.stage,
        "to": FUNNEL_STAGES[idx + 1],
        "reached": worst.reached,
        "drop_count": worst.drop_count,
        "drop_pct": worst.drop_pct,
    }


def stages_as_dicts(stats: list[StageStat]) -> list[dict]:
    return [
        {
            "stage": s.stage,
            "reached": s.reached,
            "advanced": s.advanced,
            "lost_here": s.lost_here,
            "still_here": s.still_here,
            "drop_count": s.drop_count,
            "drop_pct": round(s.drop_pct, 4),
            "avg_days_in_stage": round(s.avg_days_in_stage, 1)
            if s.avg_days_in_stage is not None
            else None,
        }
        for s in stats
    ]
