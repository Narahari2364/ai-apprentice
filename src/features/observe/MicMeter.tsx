"use client";
// Live microphone level in the bot, so the user can see it hears them.

import { useEffect, useState } from "react";

export default function MicMeter({ getLevel, active }: { getLevel: () => number; active: boolean }) {
  const [level, setLevel] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      try {
        setLevel(Math.min(1, getLevel() * 3));
      } catch {
        setLevel(0);
      }
    }, 120);
    return () => clearInterval(t);
  }, [active, getLevel]);

  return (
    <span className="flex items-center gap-1.5" title={active ? "Microphone level" : "Microphone off"}>
      <svg width="12" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" strokeLinecap="round" />
      </svg>
      <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
        {[0.08, 0.2, 0.35, 0.55, 0.75].map((th, i) => (
          <span key={i} className={`w-[3px] rounded-sm ${active && level > th ? "bg-ok" : "bg-[#c7ccd1]"}`} style={{ height: 4 + i * 2 }} />
        ))}
      </span>
    </span>
  );
}
