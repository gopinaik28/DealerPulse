"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Global filter state lives in the URL query string (`?month=&source=`) so every
 * view is shareable and the back button works. This hook is the only reader/writer.
 */
export function useFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const month = params.get("month") || "all";
  const source = params.get("source") || "";

  const setFilters = useCallback(
    (patch) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (!value || value === "all") next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  // Preserve current filters when navigating to another scope.
  const withFilters = useCallback(
    (path) => {
      const qs = params.toString();
      return qs ? `${path}?${qs}` : path;
    },
    [params],
  );

  return useMemo(
    () => ({ month, source, setFilters, withFilters, query: { month, source } }),
    [month, source, setFilters, withFilters],
  );
}
