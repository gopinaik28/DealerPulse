# DECISIONS.md — DealerPulse Architecture & Product Strategy

**Live Production URL:** [https://dealerpulse-mauve.vercel.app](https://dealerpulse-mauve.vercel.app)  
**Deployment Platform:** Vercel (Next.js 15 App Router + FastAPI Python Serverless Engine)

---

## 1. What I Chose to Build and Why

In response to the assignment prompt, I built **DealerPulse** as a high-velocity, real-time automotive network intelligence platform designed for dealership leadership (executive oversight down to branch managers). 

Rather than building a simple toy table or a single-page prototype, DealerPulse is structured around an **Executive Operating Rhythm** spanning five dedicated navigation tiers with complete drill-down capability:

1. **Executive Overview (`/`)**: High-level vital signs — Total Revenue, Units Delivered, Attainment against aggressive targets, Delivery Velocity trends, and Branch Target comparison bars.
2. **Branch Performance (`/branches` and `/branches/[branchId]`)**: Granular operational view per location (Chennai Downtown, Chennai Highway, Bangalore Lakeside, Hyderabad Central, Mumbai Eastside), surfacing local conversion funnels, quota attainment, and sales officer rankings.
3. **Sales Representative Details (`/branches/[branchId]/reps/[repId]`)**: Rep-level drill-down showing historical conversions, model mix, stage velocity, and open customer deal records with filtered status views (`Delivered`, `Open`, `Stale`, `Lost`).
4. **Interactive Sales Leaderboard (`/leaderboard`)**: Org-wide ranking of all quota-carrying sales officers with interactive sortable columns (Deals Closed, Revenue Generated, Win Rate, and Avg Deal Value) mimicking Google Drive / modern spreadsheet interactions.
5. **Lead Pipeline & Audit Trail (`/leads`)**: Full lifecycle history across all 510 leads with live duration calculation (`days_in_stage`), search, model inspection, and stage transition audit logs.
6. **Actionable Bottlenecks & Triage (`/bottlenecks`)**: Real-time management triage panel isolating cold leads (14+ days neglected) and conversion leaks with direct simulated follow-up logging actions.

### Differentiating "Open-Ended" Features Built

To exceed the minimum requirements and deliver high-impact executive value, I built two key strategic tools:

- **Interactive What-If Revenue Scenario Simulator (`RevenueSimulator.jsx`)**:  
  Allows leadership to interactively model the bottom-line financial impact of:
  - Improving Test Drive & Negotiation conversion rates (+0% to +30%).
  - Recovering stalled pipeline deals from the 27 neglected leads (worth ₹6.28Cr).
  Calculates instant projected upside in both additional Crores (`+₹Cr`) and vehicles delivered.
- **Marketing Channel ROI & Acquisition Quality Matrix (`LeadSourceROI.jsx`)**:  
  Directly analyzes conversion efficiency across all 6 acquisition channels, identifying that **Walk-ins convert at 55.7%** whereas **Social Media leads convert at only 15.2% (a 3.7x variance)**, exposing immediate CAC reallocation opportunities.

---

## 2. Key Product Decisions and Tradeoffs

### A. Dedicated Multi-Page Navigation Architecture vs. Single Long Page
- **Decision:** Implemented a persistent left navigation sidebar (FDE suite ergonomic layout) with dedicated routes (`/`, `/branches`, `/leaderboard`, `/leads`, `/bottlenecks`).
- **Tradeoff:** Required managing shared global filters (Month and Lead Source) across routes and configuring deep linking (`/branches/[id]/reps/[id]`). 
- **Why:** In automotive dealership networks, branch managers and leadership need focused, bookmarkable views rather than endlessly scrolling past charts irrelevant to their immediate task.

### B. Two Distinct Date Bases (Avoided the "June Lead in December" Pitfall)
- **Decision:** Strictly decoupled **Lead Creation Month** (`created_at`) from **Delivery & Revenue Month** (`delivery_date`).
- **Tradeoff:** A single month filter displays leads created in that month for the funnel, but calculates revenue and delivered units based on deals closed/delivered in that month.
- **Why:** In automotive sales, vehicle purchase cycles average 22–35 days. Conflating lead intake with vehicle delivery creates false attribution (e.g., leads generated June 30 delivered in July). For full-period views (`Jun–Dec 2025`), all cohorts collapse into the clean org-wide numbers (160 units delivered, ₹38.88Cr revenue).

### C. 100% Server-Side Computation via FastAPI vs. Client-Side Aggregation
- **Decision:** Built a dedicated Python FastAPI backend (`api/dealerpulse/`) that ingests, indexes, and computes all metrics server-side.
- **Tradeoff:** Slightly higher initial infrastructure setup with `vercel.json` rewrites and Python serverless bundling.
- **Why:** Realistic production data pipelines cannot push raw customer PII and 50,000+ lead event histories to client browsers. The Next.js frontend only consumes clean, aggregated JSON schemas.

### D. Frozen As-Of Clock (`2025-12-31T19:10:00Z`)
- **Decision:** Anchored relative time calculations (`days in stage`, `last activity`) to the max timestamp in the dataset.
- **Why:** Because the dataset concludes on Dec 31, 2025, using the browser's current date (`Date.now()`) would make every lead appear hundreds of days overdue. The UI explicitly states `"Data as of Dec 31, 2025"` with live relative metrics.

### E. 14-Day Inactivity Threshold for Stalled Deals
- **Decision:** Selected 14 days of zero stage movement as the threshold for actionable triage rather than 7 days.
- **Why:** At 7 days, over 80% of open automotive leads get flagged, creating alert fatigue. At 14 days, exactly 27 high-intent leads worth ₹6.28Cr are isolated—giving sales managers an actionable hit-list.

---

## 3. What the Data Actually Says: 4 Key Observations

1. **Massive 3.7x Variance in Lead Source Quality:**
   - **Walk-ins** are the highest-converting source by far: **55.7% win rate** (64 delivered / 51 lost).
   - **Social Media** is a severe budget drain: **15.2% win rate** (10 delivered / 56 lost).
   - Referrals (34.7%), Auto Expo (34.2%), and Website (31.5%) sit in an average band. Leadership should immediately shift digital ad spend toward showroom drive-to-store campaigns.

2. **Deals are Lost at the Top of the Funnel, Not at Negotiation:**
   - Out of 288 total lost leads, **114 died at `new`** (uncontacted) and **81 died at `contacted`**.
   - **67.7% of all lost deals drop off before ever taking a test drive.** The primary lost reasons recorded are `"Unresponsive after follow-up"` (38) and `"Not ready to purchase"` (40). This demonstrates an initial response-time and qualification failure, not a pricing or inventory issue.

3. **Lakeside Toyota (Bangalore, B3) is Suffering a Sales Conversion Collapse:**
   - Lakeside received 79 leads (comparable to other branches) but delivered only **6 cars total** (unit quota attainment of **2.3%**, compared to 12%–15% across peers).
   - Its primary leakage occurs between **Test Drive → Negotiation** (48% drop-off). Customers are visiting and driving the vehicles, but failing to enter commercial negotiation—indicating sales officer closing deficiencies or uncompetitive local trade-in/discount handling.

4. **Delivery Bottlenecks Double Order Lead Times:**
   - Deliveries flagged with a `delay_reason` take an average of **25.2 days** from order to handover, compared to **12.7 days** for smooth deliveries. Factory allocation delays and customer documentation lag tie up dealership working capital by ~12 extra days per vehicle.

---

## 4. What I Would Build Next with More Time

1. **Role-Based Authentication & Scope (RBAC):**
   - Automatically scope views: Branch Managers see their branch and direct sales reps; Sales Officers see only their active pipeline; Leadership accesses org-wide comparisons.
2. **PostgreSQL / Real-Time Event Streaming:**
   - Transition from JSON loading to a PostgreSQL database with Prisma/SQLAlchemy and WebSockets to push live lead updates to sales reps' mobile devices.
3. **Automated SLA Alert Webhooks (Slack/WhatsApp):**
   - Instant automated webhook alerts dispatched when a new web lead remains in `"new"` status for more than 45 minutes without phone contact.
4. **Rep Coaching & Predictive Lead Scoring:**
   - Machine learning scoring model based on lead source, model interest, and customer engagement history to prioritize reps' daily follow-up queues.
5. **Automated Inventory & Allocation Sync:**
   - Connect delivery records with live factory vehicle allocation to proactively alert reps when an ordered trim is delayed in transit.
