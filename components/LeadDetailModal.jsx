"use client";

import { useState } from "react";
import { dateLabel, inr, relativeDays, sourceLabel, stageLabel } from "@/lib/format";

export function LeadDetailModal({ lead, onClose }) {
  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl rounded-2xl border border-line bg-card shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-line bg-surface/50">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold tracking-tight text-ink">{lead.customer_name}</h2>
              <span className="nums px-2 py-0.5 rounded-full text-xs font-semibold bg-accent/15 text-accent border border-accent/30">
                {lead.id}
              </span>
            </div>
            <p className="text-sm text-ink-soft mt-1 flex items-center gap-3">
              <span>{lead.phone}</span>
              <span>·</span>
              <span className="text-accent font-medium">{sourceLabel(lead.source)}</span>
              <span>·</span>
              <span className="font-semibold text-ink">{lead.model_interested}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-ink-faint hover:text-ink hover:bg-surface border border-transparent hover:border-line transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Facts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-surface/60 border border-line/60 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">Deal value</div>
              <div className="nums text-base font-bold text-ink mt-1">{inr(lead.deal_value)}</div>
            </div>
            <div className="rounded-xl bg-surface/60 border border-line/60 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">Current status</div>
              <div className="text-sm font-bold text-accent capitalize mt-1">{stageLabel(lead.status)}</div>
            </div>
            <div className="rounded-xl bg-surface/60 border border-line/60 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">Last active</div>
              <div className="nums text-xs font-semibold text-ink-soft mt-1">{relativeDays(lead.days_since_activity)}</div>
            </div>
            <div className="rounded-xl bg-surface/60 border border-line/60 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">Created</div>
              <div className="nums text-xs font-semibold text-ink-soft mt-1">{dateLabel(lead.created_at)}</div>
            </div>
          </div>

          {/* Lost reason or Delivery Callout */}
          {lead.status === "lost" && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-rose-400">Deal Lost Reason</div>
              <div className="text-sm font-semibold text-ink mt-1">{lead.lost_reason || "No specific reason provided"}</div>
            </div>
          )}

          {lead.delivery && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-1 text-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">Delivery Fulfillment</div>
              <div className="flex justify-between items-center text-ink font-medium">
                <span>Days to deliver: <strong>{lead.delivery.days_to_deliver} days</strong></span>
                <span>Delivered on: <strong>{dateLabel(lead.delivery.delivery_date)}</strong></span>
              </div>
              {lead.delivery.delay_reason && (
                <div className="text-xs text-amber-400 mt-1">Delay cause: {lead.delivery.delay_reason}</div>
              )}
            </div>
          )}

          {/* Audit Trail Timeline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-faint mb-3">
              Status History & Activity Audit Trail ({lead.status_history?.length || 0})
            </h3>
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
              {(lead.status_history || []).map((evt, i) => (
                <div key={i} className="relative group">
                  <span className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full border-2 border-card bg-accent ring-2 ring-accent/30" />
                  <div className="rounded-xl border border-line/60 bg-surface/40 p-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-ink uppercase tracking-wide text-[11px] text-accent">
                        {stageLabel(evt.status)}
                      </span>
                      <span className="nums text-ink-faint text-[11px]">{dateLabel(evt.timestamp)}</span>
                    </div>
                    {evt.note && <p className="text-xs text-ink-soft leading-relaxed">{evt.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-line bg-surface/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-surface hover:bg-card border border-line text-xs font-semibold text-ink transition"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
