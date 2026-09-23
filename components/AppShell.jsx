"use client";

import Link from "next/link";
import { useMeta } from "@/components/MetaProvider";
import { FilterBar } from "@/components/FilterBar";

export function AppShell({ children }) {
  const meta = useMeta();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-white">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M3 17l5-6 4 3 5-7 4 5" />
              </svg>
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-ink">DealerPulse</span>
          </Link>

          <div
            className="ml-auto flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-xs text-ink-soft"
            title="This dataset has a fixed clock. All “days since / days remaining” figures are measured from the latest timestamp in the data."
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Data as of {meta.as_of_label}
          </div>
        </div>
        <div className="border-t border-line/70 bg-white/60">
          <div className="mx-auto max-w-[1180px] px-4 py-2.5 md:px-6">
            <FilterBar />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-4 py-6 md:px-6 md:py-8">{children}</main>

      <footer className="mx-auto max-w-[1180px] px-4 pb-10 pt-4 text-xs text-ink-faint md:px-6">
        DealerPulse · synthetic data · all aggregation computed server-side in FastAPI.
      </footer>
    </div>
  );
}
