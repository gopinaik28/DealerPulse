# DealerPulse

Real-time sales-performance dashboard for a 5-branch automotive dealership group.

**Org → Branch → Rep drill-down · live funnel & target-pacing analytics · a "Needs Attention"
panel that turns the data into actions.** All aggregation runs server-side in FastAPI; the
Next.js frontend just renders what the API returns.

- **Backend:** Python + FastAPI (`api/`) — data loading, funnel math, target pacing,
  stale-lead detection, drill-down queries, all as a small REST API.
- **Frontend:** Next.js (App Router, plain JavaScript) + Tailwind + Recharts.
- **Deploy:** single Vercel project — Next.js at the root, FastAPI as a Python serverless
  function under `/api`.

See **[DECISIONS.md](./DECISIONS.md)** for design rationale, the "as of Dec 31, 2025" clock,
API shapes, and what the data actually reveals.

---

## Run it locally

Two processes: the API on `:8000` and the Next.js app on `:3000` (which proxies `/api/*` to
the API in dev).

### 1. Backend

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r api/requirements.txt
npm run dev:api          # uvicorn api.index:app --reload --port 8000
```

Check it: <http://localhost:8000/docs> · <http://localhost:8000/api/overview?month=2025-12>

### 2. Frontend

```bash
npm install
npm run dev              # http://localhost:3000
```

### 3. Sanity-check the numbers

```bash
npm run sanity           # recomputes headline figures straight from the raw JSON and diffs
```

---

## API

| Endpoint | Purpose |
|---|---|
| `GET /api/meta` | Bootstrap: branches, months, sources, the fixed `as_of` clock |
| `GET /api/overview?month=&source=` | Org KPIs, branch comparison, funnel, 7-month trend, lost & delay logistics |
| `GET /api/leaderboard?month=&branch=` | Sales officer rankings with target deficits, win rates, and volume |
| `GET /api/leads?month=&branch=&stage=&source=` | Master list of all 510 leads with days in stage and rep assignments |
| `GET /api/branches/{branch_id}?month=&source=` | Branch KPIs, rep ranking, branch funnel/trend |
| `GET /api/reps/{rep_id}?month=&source=` | Rep KPIs, rep funnel, full lead list |
| `GET /api/insights?month=&source=&branch=&threshold_days=` | Stale leads (27), target risk, funnel drop-off, branch readouts |

`month` is `YYYY-MM` (2025-06 … 2025-12) or `all`. `source` is one of
`walk_in, website, referral, social_media, phone_enquiry, auto_expo`.

---

## Project layout

```
api/
  index.py                 ASGI entrypoint — thin FastAPI route handlers
  requirements.txt
  dealerpulse/
    data.py                load dealership_data.json once, build indexes
    models.py              parsed domain entities (+ derived fields)
    time_utils.py          the fixed AS_OF clock, month math
    filters.py             scope / period / source filtering
    funnel.py              stage-reach + drop-off from status_history
    metrics.py             KPIs, branch comparison, trend
    rankings.py            rep ranking within a branch
    insights.py            the "Needs Attention" panel
app/                       Next.js App Router pages (.jsx)
components/                KPI cards, charts, tables, insights panel, filter bar
lib/                       api client, format helpers, hooks
scripts/sanity.py          number-verification against the raw dataset
dealership_data.json       source data (canonical copy, bundled into the function on deploy)
vercel.json                Python function + /api rewrite config
```

## Deploy to Vercel

```bash
vercel            # preview
vercel --prod     # production
```

`vercel.json` wires the Python function and the `/api/(.*) → /api/index` rewrite. After
deploy, verify the API directly (not just the frontend):

```bash
curl https://<deployment>/api/meta
curl "https://<deployment>/api/overview?month=2025-12"
curl https://<deployment>/api/insights
```
