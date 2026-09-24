// Display formatting helpers. Kept dependency-free and pure.

const MONTH_NAMES = {
  "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun",
  "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
};

/** ₹ amount → Indian short form: ₹1.2Cr, ₹45.0L, ₹8,200. */
export function inr(amount, { decimals = 1 } = {}) {
  if (amount == null || Number.isNaN(amount)) return "—";
  const n = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (n >= 1e7) return `${sign}₹${(n / 1e7).toFixed(decimals)}Cr`;
  if (n >= 1e5) return `${sign}₹${(n / 1e5).toFixed(decimals)}L`;
  return `${sign}₹${Math.round(n).toLocaleString("en-IN")}`;
}

/** Full rupee value with grouping, for tooltips. */
export function inrFull(amount) {
  if (amount == null) return "—";
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function pct(value, { decimals = 0 } = {}) {
  if (value == null || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatPct(value, decimals = 1) {
  if (value == null || Number.isNaN(value)) return "0.0%";
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatCrores(amount, decimals = 2) {
  if (amount == null || Number.isNaN(amount)) return "₹0 Cr";
  return `₹${(amount / 1e7).toFixed(decimals)} Cr`;
}

export function formatLakhs(amount, decimals = 2) {
  if (amount == null || Number.isNaN(amount)) return "₹0 L";
  return `₹${(amount / 1e5).toFixed(decimals)} Lakhs`;
}

export function num(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("en-IN");
}

/** "2025-06" → "Jun 2025"; "2025-06" with short=true → "Jun". */
export function monthLabel(m, { short = false } = {}) {
  if (!m || m === "all") return "Jun–Dec 2025";
  const [year, mm] = m.split("-");
  return short ? MONTH_NAMES[mm] : `${MONTH_NAMES[mm]} ${year}`;
}

export function dateLabel(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function relativeDays(days) {
  if (days == null) return "—";
  const r = Math.round(days);
  if (r <= 0) return "today";
  if (r === 1) return "1 day ago";
  return `${r} days ago`;
}

const SOURCE_LABELS = {
  walk_in: "Walk-in",
  website: "Website",
  referral: "Referral",
  social_media: "Social media",
  phone_enquiry: "Phone enquiry",
  auto_expo: "Auto expo",
};
export const sourceLabel = (s) => SOURCE_LABELS[s] || s;

const STAGE_LABELS = {
  new: "New",
  contacted: "Contacted",
  test_drive: "Test drive",
  negotiation: "Negotiation",
  order_placed: "Order placed",
  delivered: "Delivered",
  lost: "Lost",
};
export const stageLabel = (s) => STAGE_LABELS[s] || s;

/** Semantic color token for an attainment/verdict status string. */
export const STATUS_STYLES = {
  on_track: { label: "On track", cls: "border-good/30 bg-good-soft text-good", dot: "bg-good" },
  at_risk: { label: "At risk", cls: "border-warn/30 bg-warn-soft text-warn", dot: "bg-warn" },
  behind: { label: "Behind", cls: "border-warn/30 bg-warn-soft text-warn", dot: "bg-warn" },
  will_miss: { label: "Will miss", cls: "border-bad/30 bg-bad-soft text-bad", dot: "bg-bad" },
  critical: { label: "Critical", cls: "border-bad/30 bg-bad-soft text-bad", dot: "bg-bad" },
};
export const statusStyle = (s) => STATUS_STYLES[s] || STATUS_STYLES.behind;

export const CHART = {
  actual: "#0284C7",
  target: "#94A3B8",
  good: "#059669",
  warn: "#D97706",
  bad: "#DC2626",
  lost: "#EF4444",
  grid: "#E2E8F0",
};
