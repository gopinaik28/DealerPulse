"use client";

import Link from "next/link";
import { useFilters } from "@/lib/useFilters";

/** trail: [{ label, href }] — last item is rendered as the current (non-link) page. */
export function Breadcrumbs({ trail }) {
  const { withFilters } = useFilters();
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm">
      {trail.map((item, i) => {
        const last = i === trail.length - 1;
        return (
          <span key={item.href || item.label} className="flex items-center gap-1.5">
            {i > 0 && (
              <svg className="h-3.5 w-3.5 text-ink-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" />
              </svg>
            )}
            {last || !item.href ? (
              <span className="font-semibold text-ink">{item.label}</span>
            ) : (
              <Link href={withFilters(item.href)} className="text-ink-soft hover:text-ink hover:underline">
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
