"use client";

import { createContext, useContext } from "react";
import { useApi } from "@/lib/useApi";
import { getMeta } from "@/lib/api";

const MetaContext = createContext(null);

/** Loads /api/meta once and shares it (branches, months, sources, the fixed clock). */
export function MetaProvider({ children }) {
  const { data, error, loading } = useApi(({ signal }) => getMeta({ signal }), []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-ink-soft">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-accent" />
          Starting DealerPulse…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="card card-pad max-w-md text-center">
          <p className="font-semibold text-ink">Couldn&apos;t reach the API</p>
          <p className="mt-1 text-sm text-ink-soft">
            The FastAPI backend isn&apos;t responding. In local dev, run{" "}
            <code className="rounded bg-line px-1">npm run dev:api</code> alongside{" "}
            <code className="rounded bg-line px-1">npm run dev</code>.
          </p>
          <p className="mt-2 text-xs text-ink-faint">{String(error.message)}</p>
        </div>
      </div>
    );
  }

  return <MetaContext.Provider value={data}>{children}</MetaContext.Provider>;
}

export function useMeta() {
  const ctx = useContext(MetaContext);
  if (!ctx) throw new Error("useMeta must be used within MetaProvider");
  return ctx;
}
