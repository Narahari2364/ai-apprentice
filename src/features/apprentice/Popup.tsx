"use client";
// The Apprentice's floating card: indigo header (so it is clearly the agent, not
// Ledgerline), a mode label, drag by the header, fold down to a small bar.

import { useRef, useState, type ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  modeLabel?: string;
  /** Initial position, in px from the viewport edges. */
  initial: { top?: number; left?: number; right?: number; bottom?: number };
  width?: number;
  foldable?: boolean;
  onClose?: () => void;
  children: ReactNode;
}

export default function Popup({ title, subtitle, modeLabel, initial, width = 400, foldable = false, onClose, children }: Props) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [folded, setFolded] = useState(false);
  const card = useRef<HTMLDivElement>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  function onPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("button")) return;
    const r = card.current!.getBoundingClientRect();
    drag.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const x = Math.max(4, Math.min(window.innerWidth - 120, e.clientX - drag.current.dx));
    const y = Math.max(4, Math.min(window.innerHeight - 48, e.clientY - drag.current.dy));
    setPos({ x, y });
  }

  const style: React.CSSProperties = pos ? { left: pos.x, top: pos.y, width } : { ...initial, width };

  return (
    <div
      ref={card}
      role="dialog"
      aria-label={title}
      className="fixed z-50 flex max-h-[calc(100vh-24px)] flex-col overflow-hidden rounded-sm border border-[#cfd2d8] bg-white shadow-[0_8px_28px_rgba(20,28,38,.22)]"
      style={style}
    >
      <div
        className="flex cursor-move select-none items-center gap-3 bg-indigo px-4 py-2.5 text-white"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => (drag.current = null)}
      >
        <svg width="22" height="20" viewBox="0 0 18 16" aria-hidden="true">
          <path d="M1.5 1.5h15v10H6L1.5 15z" fill="#fff" />
          <path d="M5 5h8M5 8h5" stroke="#5146d9" strokeWidth="1.4" />
        </svg>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-[17px] font-medium">{title}</div>
          {subtitle && <div className="truncate text-[12.5px] opacity-90">{subtitle}</div>}
        </div>
        {modeLabel && (
          <span className="rounded-sm border border-white/70 px-2 py-0.5 text-[11.5px] font-bold tracking-wide">{modeLabel}</span>
        )}
        {foldable && (
          <button onClick={() => setFolded((f) => !f)} aria-label={folded ? "Expand" : "Fold"} className="px-1 text-[18px] leading-none">
            {folded ? "▴" : "▾"}
          </button>
        )}
        {onClose && (
          <button onClick={onClose} aria-label="Close" className="px-1 text-[22px] leading-none">
            ×
          </button>
        )}
      </div>
      {!folded && <div className="min-h-0 overflow-y-auto">{children}</div>}
    </div>
  );
}

/** Small animated bars shown while the agent is listening. */
export function ListeningBars({ active }: { active: boolean }) {
  return (
    <span className="inline-flex h-4 items-end gap-[2px]" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`w-[3px] rounded-sm bg-indigo ${active ? "animate-pulse" : ""}`}
          style={{ height: `${[6, 12, 16, 10, 7][i]}px`, animationDelay: `${i * 120}ms` }}
        />
      ))}
    </span>
  );
}
