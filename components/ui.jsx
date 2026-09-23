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
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
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
    neutral: "border-line bg-white text-ink-soft",
    accent: "border-accent/20 bg-accent-soft text-accent",
    good: "border-good/30 bg-good-soft text-good",
    warn: "border-warn/30 bg-warn-soft text-warn",
    bad: "border-bad/30 bg-bad-soft text-bad",
  };
  return <span className={`pill ${tones[tone]}`}>{children}</span>;
}

/** Small inline progress bar (attainment vs 100%). */
export function MiniBar({ value, tone = "accent", className = "" }) {
  const tones = { accent: "bg-accent", good: "bg-good", warn: "bg-warn", bad: "bg-bad" };
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-line ${className}`}>
      <div
        className={`h-full rounded-full ${tones[tone]}`}
        style={{ width: `${Math.max(2, Math.min(100, (value || 0) * 100))}%` }}
      />
    </div>
  );
}

export function SegmentedControl({ options, value, onChange, size = "sm" }) {
  const pad = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";
  return (
    <div className="inline-flex rounded-lg border border-line bg-white p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-md font-medium transition ${pad} ${
            value === opt.value ? "bg-ink text-white" : "text-ink-soft hover:text-ink"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
