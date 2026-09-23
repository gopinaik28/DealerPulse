# DECISIONS.md

Design and product decisions for **DealerPulse**, plus what the data actually says.

---

## 1. What I built

A three-level analytics dashboard (Org → Branch → Rep) over the dealership dataset, with a
dedicated **"Needs Attention"** panel that turns the numbers into things a manager can act on
this week.

- **FastAPI backend** (`api/`) owns 100% of the aggregation. The frontend never sees a raw
  lead — it calls five endpoints and renders the shapes they return.
- **Next.js (App Router, plain JS)** frontend: an Overview page, a Branch page, a Rep page,
  a global filter bar, and the insights panel as a right rail.
- Deployed as a **single Vercel project** — Next.js at the root, FastAPI as a Python
  serverless function under `/api`.

### The "open-ended" feature I picked: **conversion funnel drop-off analysis**

Every lead carries a full `status_history`, so I can reconstruct exactly where each lead left
the funnel. The insights panel computes, live:

- the single stage-to-stage transition that loses the largest share of the leads that reach it
  — org-wide, **and per branch**;
- **source quality**: conversion rate and worst leak for each of the 6 lead sources.

**Why this over the alternatives:**

| Alternative | Why I passed |
|---|---|
| Delivery-delay analysis (`deliveries.delay_reason`) | Real signal (see §7), but it's an ops/logistics problem, not a *sales-performance* lever — narrower fit for a sales dashboard. Surfaced as a KPI (`avg days to deliver`) instead. |
| Rep-efficiency deep-dive (time-to-contact, activity cadence) | Partly covered by the rep ranking already; would mostly restate the funnel story at rep grain. |
| Lead-aging cohorts | Overlaps heavily with the stale-lead insight I already build. |

Funnel drop-off won because it's the one analysis that (a) uses this dataset's unique asset
(the audit trail), (b) points at a *specific* fixable step ("your test-drive→negotiation
hand-off at Lakeside leaks 48%"), and (c) composes naturally with the branch/source filters.

### Natural-language branch readouts

One templated paragraph per branch, generated with plain Python string templating (no LLM, no
network) — e.g.:

> *Lakeside Toyota is 95% behind its December target with the month closed out (2 of 42
> units). Biggest funnel leak: test drive → negotiation (loses 48% of leads that get there).
> 4 open leads (₹1.2Cr) have had no activity in 14+ days.*

Zero external dependencies so the demo works offline.

---

## 2. The fixed "as of" clock

The dataset ends mid-stream on 2025-12-31. Treating "today" as the real date would make every
open lead look ~9 months stale. So:

- **`AS_OF` = the latest timestamp anywhere in the data** = `2025-12-31T19:10:00Z`, computed
  once at load (`api/dealerpulse/data.py`).
- Every "days since activity" / "days remaining in month" / pacing calculation uses it.
- The UI shows a **"Data as of Dec 31, 2025"** pill in the header (with a tooltip explaining
  the frozen clock) and repeats "as of Dec 31, 2025" on the insights panel, so a reviewer
  never mistakes it for a bug.

"Real-time" here means **recomputed server-side on every request** from the source of truth —
there is no live feed to stream.

---

## 3. Two date bases (deliberate, documented)

A metric "for June" can mean two different things, and conflating them produces nonsense
(a lead created June 30 can't have converted yet). So:

| Basis | Used for | Rationale |
|---|---|---|
| **`created_at` in month** | lead counts (total / open), funnel | "the leads that came in during this window" |
| **`delivery_date` in month** | units, revenue, attainment, avg days-to-deliver | "the cars that left the lot during this window" — matches how targets are set |
| **resolution date in month** (`delivery_date`, or the `lost` event timestamp) | **conversion rate**, deals won / lost / resolved, rep conversion | "of the deals *decided* this month, how many did we win?" — stable month-to-month, and keeps every rep row internally consistent (units delivered ↔ conversion) |

`GET /api/overview?month=all` uses the whole Jun–Dec window and every basis collapses to the
same population, so the headline conversion is the intuitive **160 / (160 + 288) = 35.7%**.

---

## 4. Stale-lead threshold = 14 days

Confirmed with the stakeholder. At the frozen clock, a 7-day cutoff flags almost every one of
the 62 open leads (noise); 14 days isolates the genuinely neglected ones (27 leads,
₹6.3Cr of pipeline). Configurable per request: `GET /api/insights?threshold_days=N`.

Stale detection **ignores the month filter** — a lead that went cold in July is still cold in
December. Everything else on the panel respects the filter.

---

## 5. Attainment status thresholds

`status` on the branch comparison and `verdict` on target-risk are computed as
`attainment ÷ expected-pace` (where expected-pace = fraction of the period elapsed;
1.0 for a closed month or the whole window):

| Bucket | Ratio | Colour |
|---|---|---|
| `on_track` | ≥ 0.8 | green |
| `behind` / `at_risk` | 0.4 – 0.8 | amber |
| `critical` / `will_miss` | < 0.4 | red |

**With this dataset almost every branch is `critical`** — total targets are ~1,426 units
against 160 delivered (~11% attainment). That is a real finding, not a bug: the targets are
aggressively set and the group is missing them badly. The branch **bars are drawn on a true
0–100% scale** (not normalised to the leader) so the distance-from-target reads honestly, and
the worst-first sort + the insights panel carry the branch-to-branch comparison.

---

## 6. API shape

Five endpoints, consistent query params (`month` = `YYYY-MM` | `all`, `source`, plus
`branch` on `/insights`):

| Endpoint | Returns |
|---|---|
| `GET /api/meta` | branches, months, sources, the `as_of` clock, stale threshold — one bootstrap call |
| `GET /api/overview` | org KPIs, worst-first branch comparison, funnel, 7-month trend |
| `GET /api/branches/{id}` | branch KPIs, rep ranking, branch funnel, trend, "how it ranks" |
| `GET /api/reps/{id}` | rep KPIs, rep funnel, full lead list |
| `GET /api/insights` | stale leads, target risk, funnel drop-off + source quality, branch readouts |

Response shapes are documented inline in `api/index.py` and the plan. Backend is layered:
`data.py` (load + index once) → `filters.py` / `funnel.py` / `metrics.py` / `rankings.py` /
`insights.py` (pure, type-hinted, docstring'd aggregation) → thin route handlers that only
parse params and delegate. Data is parsed once into dict indexes (`leads_by_branch`,
`leads_by_rep`, `targets_by_branch_month`, …); aggregations are single-pass over pre-filtered
lists — built to scale past 510 rows even though 510 is tiny.

Branch **managers carry no leads** in this data, so the rep ranking lists only the 5 sales
officers; the branch header shows "led by <manager>" separately.

---

## 7. Deployment: FastAPI + Next.js on one Vercel project

- `api/index.py` exposes `app` (ASGI FastAPI). Vercel's Python runtime serves it as a
  serverless function; `api/requirements.txt` sits next to it.
- FastAPI declares routes **with** the `/api` prefix; Next.js has **no** `app/api` directory,
  so there is no route collision.
- `vercel.json` rewrites `/api/(.*)` → `/api/index` and `includeFiles: dealership_data.json`
  bundles the dataset into the function.
- `next.config.mjs` proxies `/api/*` to a local `uvicorn` **only in dev**; in production the
  `vercel.json` rewrite takes over.
- Known rough edges accounted for: `requirements.txt` location, the routing rewrite, bundling
  the data file, and cold starts (the store builds lazily and is cached for the life of the
  warm function).

Local verification done: `scripts/sanity.py` (numbers vs raw JSON), FastAPI `/docs`, and full
click-through of all three levels + every filter + empty combos. Live Vercel verification is
the final step, to be run with the stakeholder.

---

## 8. What the data actually says (real observations)

1. **Lead source quality varies 3.7×.** Walk-ins convert at **55.7%** (64W / 51L); social-media
   leads convert at **15.2%** (10W / 56L). Referral / auto-expo / website / phone sit in a
   28–35% band. Whatever is being spent on social-media lead-gen is buying the worst leads in
   the group by a wide margin.

2. **The group loses deals at the top of the funnel, not at the close.** 56.5% of all leads are
   lost. Of those losses, **114 never got past "new" and another 81 died at "contacted"** —
   **68% of every lost deal is lost before a test drive even happens.** The dominant lost
   reasons reinforce it: "Unresponsive after follow-up" (38) and "Not ready to purchase" (40).
   This is a follow-up-discipline problem, and it's exactly what the stale-lead insight is
   built to catch.

3. **Lakeside Toyota (B3) is a conversion collapse, not a volume problem.** It took in 79 leads
   (in line with its peers) and delivered **6**. Its unit attainment is **2.3%** versus a
   12–15% band for the other four branches. Its worst funnel step is test_drive → negotiation
   (loses 48%) — customers are showing up and driving the car, then walking.

4. **Delays roughly double the delivery time.** 45% of deliveries carry a `delay_reason`, and
   those take **25.2 days** on order-to-delivery versus **12.7 days** for clean ones. The
   biggest causes are customer-requested date changes, factory allocation, and transit
   logistics — an ops lever worth ~12 days of working capital per affected car.

---

## 9. What I'd build next

- **AuthN/AuthZ + roles** — scope a branch manager to their own branch, keep the org view for leadership.
- **Real datastore + ingestion** — swap the JSON load for Postgres, add an ingest job, and a
  proper `as_of = now()`.
- **Response caching / precompute** — memoize aggregations per `(scope, month, source)` and
  invalidate on ingest; today every request recomputes.
- **Alerting** — push the "Needs Attention" items to Slack/email when a branch crosses a
  target-risk threshold or a lead goes stale.
- **Rep activity feed & SLA timers** — time-to-first-contact SLA, overdue-follow-up queue.
- **Configurable targets & scenario planning** — edit targets in-app, model "what if Lakeside
  hits peer-average conversion".
- **CSV / scheduled-PDF export** of any view.
- **Drill-through from a funnel stage** straight to the list of leads sitting in (or lost from) it.
