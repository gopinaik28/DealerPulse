"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMeta } from "@/components/MetaProvider";
import { HeaderFilters } from "@/components/HeaderFilters";

const NAV_ITEMS = [
  {
    label: "Overview Dashboard",
    href: "/",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Branch Performance",
    href: "/branches",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Sales Leaderboard",
    href: "/leaderboard",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Pipeline & Leads",
    href: "/leads",
    badge: "510",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    label: "Actionable Bottlenecks",
    href: "/bottlenecks",
    badge: "27",
    badgeTone: "amber",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    label: "Revenue Simulator",
    href: "/simulator",
    badge: "Interactive",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

export function AppShell({ children }) {
  const meta = useMeta();
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      {/* 1. Left Sidebar Navigation */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-line bg-surface/90 p-4 backdrop-blur lg:flex">
        <div className="space-y-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 px-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-canvas shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 17l5-6 4 3 5-7 4 5" />
              </svg>
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-ink">DealerPulse</span>
              </div>
              <p className="text-[10px] text-ink-faint">Dealership Network Intelligence</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-accent/15 text-accent shadow-sm"
                      : "text-ink-soft hover:bg-card-hover hover:text-ink"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        item.badgeTone === "amber"
                          ? "bg-warn/20 text-warn"
                          : "bg-canvas text-ink-soft border border-line"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Network Health Footer */}
        <div className="rounded-xl border border-line bg-canvas/60 p-3.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-ink">Network Health</span>
            <span className="flex h-2 w-2 rounded-full bg-good animate-pulse" />
          </div>
          <p className="mt-1 text-[11px] text-ink-soft leading-tight">
            Active monitoring across 5 regional branches.
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-line/50 pt-2 text-[10px] text-ink-faint">
            <span>Total Enquiries</span>
            <span className="nums font-bold text-accent">510 Leads</span>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            {/* Mobile Logo */}
            <div className="flex items-center gap-2 lg:hidden">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-canvas">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 17l5-6 4 3 5-7 4 5" />
                </svg>
              </span>
              <span className="text-sm font-bold tracking-tight text-ink">DealerPulse</span>
            </div>

            {/* As-Of Data Pill */}
            <div
              className="hidden items-center gap-1.5 rounded-full border border-line bg-canvas px-2.5 py-1 text-xs text-ink-soft sm:flex"
              title="This dataset has a fixed clock. All metrics are calculated as of latest date in the dataset."
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Data as of {meta.as_of_label}
            </div>

            {/* Global Header Filters */}
            <div className="ml-auto">
              <HeaderFilters />
            </div>
          </div>

          {/* Mobile Navigation Tabs */}
          <div className="flex overflow-x-auto border-t border-line/60 px-4 py-2 lg:hidden">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap px-3 py-1 text-xs font-semibold ${
                    isActive ? "text-accent border-b-2 border-accent" : "text-ink-soft"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>

        <footer className="border-t border-line/60 px-4 py-4 text-xs text-ink-faint sm:px-6 lg:px-8">
          DealerPulse Network Intelligence · 100% server-side FastAPI computation · Data as of Dec 31, 2025
        </footer>
      </div>
    </div>
  );
}
