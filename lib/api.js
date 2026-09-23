// Single place that knows how to talk to the FastAPI backend.
// Components never build URLs or call fetch directly — they use these functions
// (via the useApi hook) so query-param handling stays consistent.

function buildQuery(params = {}) {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === "" || value === "all") continue;
    usp.set(key, value);
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiGet(path, params, { signal } = {}) {
  const res = await fetch(`/api${path}${buildQuery(params)}`, {
    signal,
    headers: { accept: "application/json" },
  });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(detail, res.status);
  }
  return res.json();
}

export const getMeta = (opts) => apiGet("/meta", {}, opts);

export const getOverview = ({ month, source } = {}, opts) =>
  apiGet("/overview", { month, source }, opts);

export const getBranch = (branchId, { month, source } = {}, opts) =>
  apiGet(`/branches/${branchId}`, { month, source }, opts);

export const getRep = (repId, { month, source } = {}, opts) =>
  apiGet(`/reps/${repId}`, { month, source }, opts);

export const getInsights = ({ month, source, branch, threshold_days } = {}, opts) =>
  apiGet("/insights", { month, source, branch, threshold_days }, opts);
