"""DealerPulse REST API — Vercel Python serverless entrypoint.

Exposes ``app`` (an ASGI FastAPI instance). Route handlers are intentionally thin:
they validate query params and delegate to the ``dealerpulse`` package, which owns
all data loading and aggregation.
"""

from __future__ import annotations

import os
import sys

# Make the sibling ``dealerpulse`` package importable both locally
# (``uvicorn api.index:app`` from repo root) and on Vercel (function root = ``api/``).
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import APIRouter, FastAPI, HTTPException, Query as Q  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402

from dealerpulse import insights as insights_mod  # noqa: E402
from dealerpulse import metrics, rankings  # noqa: E402
from dealerpulse.data import get_store  # noqa: E402
from dealerpulse.filters import Query, period_leads  # noqa: E402
from dealerpulse.funnel import funnel_stats, stages_as_dicts  # noqa: E402
from dealerpulse.leads import DEFAULT_STALE_DAYS, serialize_lead  # noqa: E402
from dealerpulse.models import FUNNEL_STAGES, LEAD_SOURCES  # noqa: E402
from dealerpulse.time_utils import MONTHS, normalize_month  # noqa: E402

app = FastAPI(
    title="DealerPulse API",
    version="1.0.0",
    description="Server-side aggregation for the DealerPulse dealership dashboard.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

api = APIRouter(prefix="/api")

# --------------------------------------------------------------------------- #
# Shared param parsing
# --------------------------------------------------------------------------- #
MonthParam = Q(default="all", description="YYYY-MM within 2025-06..2025-12, or 'all'")
SourceParam = Q(default=None, description=f"One of: {', '.join(LEAD_SOURCES)}")


def parse_month(raw: str | None) -> str | None:
    month = normalize_month(raw)
    if month is not None and month not in MONTHS:
        raise HTTPException(422, f"month must be one of {MONTHS} or 'all'")
    return month


def parse_source(raw: str | None) -> str | None:
    if raw in (None, "", "all"):
        return None
    if raw not in LEAD_SOURCES:
        raise HTTPException(422, f"source must be one of {list(LEAD_SOURCES)}")
    return raw


def _funnel_block(leads) -> dict:
    stats = funnel_stats(leads)
    return {
        "stages": stages_as_dicts(stats),
        "lost_total": sum(1 for l in leads if l.is_lost),
        "population": len(leads),
    }


# --------------------------------------------------------------------------- #
# Endpoints
# --------------------------------------------------------------------------- #
@api.get("/meta")
def meta() -> dict:
    """Bootstrap payload for the frontend: branches, months, sources, the fixed clock."""
    store = get_store()
    return {
        "as_of": store.as_of.isoformat(),
        "as_of_label": store.as_of.strftime("%b %-d, %Y"),
        "generated_at": store.generated_at,
        "months": MONTHS,
        "sources": list(LEAD_SOURCES),
        "funnel_stages": list(FUNNEL_STAGES),
        "stale_threshold_days": DEFAULT_STALE_DAYS,
        "branches": [
            {"id": b.id, "name": b.name, "city": b.city}
            for b in store.branches.values()
        ],
    }


@api.get("/overview")
def overview(month: str = MonthParam, source: str | None = SourceParam) -> dict:
    """Org-wide KPIs, worst-first branch comparison, funnel and 7-month trend."""
    store = get_store()
    q = Query(month=parse_month(month), source=parse_source(source))
    return {
        "scope": {"level": "org", "month": q.month or "all", "source": q.source},
        "kpis": metrics.compute_kpis(store, q).as_dict(),
        "branch_comparison": metrics.branch_comparison(store, q),
        "funnel": _funnel_block(period_leads(store, q)),
        "trend": metrics.trend(store, q),
    }


@api.get("/branches/{branch_id}")
def branch_detail(
    branch_id: str, month: str = MonthParam, source: str | None = SourceParam
) -> dict:
    """Branch-scoped KPIs, rep ranking within the branch, branch funnel and trend."""
    store = get_store()
    if branch_id not in store.branches:
        raise HTTPException(404, f"Unknown branch '{branch_id}'")
    q = Query(month=parse_month(month), source=parse_source(source), branch_id=branch_id)
    branch = store.branches[branch_id]
    managers = [r for r in store.reps_by_branch.get(branch_id, []) if r.role == "branch_manager"]
    return {
        "scope": {
            "level": "branch",
            "branch_id": branch_id,
            "branch_name": branch.name,
            "city": branch.city,
            "team_lead": managers[0].name if managers else None,
            "team_size": sum(1 for r in store.reps_by_branch.get(branch_id, []) if r.role == "sales_officer"),
            "month": q.month or "all",
            "source": q.source,
        },
        "kpis": metrics.compute_kpis(store, q).as_dict(),
        "rep_ranking": rankings.rep_ranking(store, q),
        "funnel": _funnel_block(period_leads(store, q)),
        "trend": metrics.trend(store, q),
        "branch_comparison": metrics.branch_comparison(store, q),
    }


@api.get("/reps/{rep_id}")
def rep_detail(
    rep_id: str, month: str = MonthParam, source: str | None = SourceParam
) -> dict:
    """Rep-scoped KPIs, their funnel and their full lead list."""
    store = get_store()
    if rep_id not in store.reps:
        raise HTTPException(404, f"Unknown rep '{rep_id}'")
    rep = store.reps[rep_id]
    q = Query(
        month=parse_month(month),
        source=parse_source(source),
        branch_id=rep.branch_id,
        rep_id=rep_id,
    )
    lead_list = sorted(
        (serialize_lead(l, store.as_of) for l in period_leads(store, q)),
        key=lambda d: d["last_activity_at"],
        reverse=True,
    )
    return {
        "scope": {
            "level": "rep",
            "rep_id": rep_id,
            "rep_name": rep.name,
            "role": rep.role,
            "branch_id": rep.branch_id,
            "branch_name": store.branch_name(rep.branch_id),
            "month": q.month or "all",
            "source": q.source,
        },
        "kpis": metrics.compute_kpis(store, q).as_dict(),
        "funnel": _funnel_block(period_leads(store, q)),
        "leads": lead_list,
        "lead_count": len(lead_list),
    }


@api.get("/insights")
def insights(
    month: str = MonthParam,
    source: str | None = SourceParam,
    branch: str | None = Q(default=None),
    threshold_days: int = Q(default=DEFAULT_STALE_DAYS, ge=1, le=180),
) -> dict:
    """The "Needs Attention" panel — stale leads, target risk, funnel drop-off, summaries."""
    store = get_store()
    if branch is not None and branch not in store.branches:
        raise HTTPException(404, f"Unknown branch '{branch}'")
    q = Query(month=parse_month(month), source=parse_source(source), branch_id=branch)
    return insights_mod.insights_panel(store, q, threshold_days)


@app.get("/api")
@app.get("/api/health")
def health() -> dict:
    store = get_store()
    return {"status": "ok", "leads": len(store.leads), "as_of": store.as_of.isoformat()}


app.include_router(api)
