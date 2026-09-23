"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Fetch helper hook: runs `fetcher` whenever `deps` change, tracks
 * loading / error / data, cancels in-flight requests, and exposes `refetch`.
 *
 * `fetcher` receives `{ signal }` and should call into lib/api.js.
 */
export function useApi(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback((signal) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    return fetcherRef.current({ signal })
      .then((data) => {
        if (!signal?.aborted) setState({ data, error: null, loading: false });
      })
      .catch((err) => {
        if (err?.name === "AbortError" || signal?.aborted) return;
        setState({ data: null, error: err, loading: false });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    run(ctrl.signal);
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const refetch = useCallback(() => {
    const ctrl = new AbortController();
    run(ctrl.signal);
  }, [run]);

  return { ...state, refetch };
}
