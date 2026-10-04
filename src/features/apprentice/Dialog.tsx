"use client";
// Centered Apprentice dialog (debrief, teach-back, export, session report): Ledgerline-style
// modal with the Apprentice's indigo header and a mode label.

import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  modeLabel: string;
  width?: number;
  footer?: ReactNode;
  children: ReactNode;
}

export default function Dialog({ title, subtitle, modeLabel, width = 860, footer, children }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(20,28,38,.45)] p-4">
      <div role="dialog" aria-label={title} className="flex max-h-[92vh] w-full flex-col bg-white shadow-[0_10px_40px_rgba(0,0,0,.3)]" style={{ maxWidth: width }}>
        <div className="flex items-center gap-3 bg-indigo px-5 py-3 text-white">
          <svg width="24" height="22" viewBox="0 0 18 16" aria-hidden="true">
            <path d="M1.5 1.5h15v10H6L1.5 15z" fill="#fff" />
            <path d="M5 5h8M5 8h5" stroke="#5146d9" strokeWidth="1.4" />
          </svg>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-[19px] font-medium">{title}</div>
            {subtitle && <div className="truncate text-[13px] opacity-90">{subtitle}</div>}
          </div>
          <span className="rounded-sm border border-white/70 px-2 py-0.5 text-[12px] font-bold tracking-wide">{modeLabel}</span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="flex items-center gap-3 border-t border-line px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

export const btnIndigo = "h-10 rounded-sm bg-indigo px-4 text-[15px] text-white hover:bg-indigo-dark disabled:opacity-50";
export const btnIndigoOutline = "h-10 rounded-sm border border-indigo bg-white px-4 text-[15px] text-indigo hover:bg-indigo-soft disabled:opacity-50";
