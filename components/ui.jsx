"use client";

import { statusStyle } from "@/lib/format";

export function Card({ className = "", children, ...rest }) {
  return (
    <section className={`card ${className}`} {...rest}>
      {children}
    </section>
  );
}

export function CardHeader({ title, subtitle, right }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
      <div>
        <h3 className="text-sm font-semibold tracking-tight text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-ink-faint">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function StatusPill({ status }) {
  const s = statusStyle(status);
  return (
    <span className={`pill ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function Pill({ tone = "neutral", children }) {
  const tones = {
    neutral: "border-line bg-card/60 text-ink-soft",
    accent: "border-accent/30 bg-accent-soft text-accent",
    good: "border-good/30 bg-good-soft text-good",
    warn: "border-warn/30 bg-warn-soft text-warn",
    bad: "border-bad/30 bg-bad-soft text-bad",
  };
  return <span className={`pill ${tones[tone]}`}>{children}</span>;
}

/** Small inline progress bar (attainment vs 100%). */
export function MiniBar({ value, tone = "accent", className = "" }) {
  const tones = { 
    accent: "bg-gradient-to-r from-primary to-accent", 
    good: "bg-gradient-to-r from-emerald-500 to-teal-400", 
    warn: "bg-gradient-to-r from-amber-500 to-yellow-400", 
    bad: "bg-gradient-to-r from-rose-500 to-red-400" 
  };
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-line/80 ${className}`}>
      <div
        className={`h-full rounded-full ${tones[tone] || tones.accent}`}
        style={{ width: `${Math.max(2, Math.min(100, (value || 0) * 100))}%` }}
      />
    </div>
  );
}

export function SegmentedControl({ options, value, onChange, size = "sm" }) {
  const pad = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";
  return (
    <div className="inline-flex rounded-lg border border-line bg-surface/80 p-0.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`${pad} rounded-md font-medium transition ${
              active
                ? "bg-accent/20 text-accent font-semibold shadow-sm border border-accent/30"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
