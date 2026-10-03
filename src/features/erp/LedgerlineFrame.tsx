"use client";
// Embeds Ledgerline (public/ledgerline/index.html, unchanged) and connects it to
// src/lib/ledgerline.ts. Ledgerline needs 1180px, so the frame is scaled to fit.
// overflow-clip (not hidden): Ledgerline calls scrollIntoView, which would otherwise
// scroll this same-origin wrapper sideways and cut off its left edge.

import { useEffect, useRef, useState } from "react";
import { attachLedgerline, sendCommand } from "@/lib/ledgerline";

const MOCK_WIDTH = 1180;

interface Props {
  /** Query string for Ledgerline, e.g. "user=sabine" or "user=lena&guard=1". */
  query: string;
  /** Called once Ledgerline has loaded and can take commands. */
  onReady?: () => void;
}

export default function LedgerlineFrame({ query, onReady }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const onReadyRef = useRef(onReady);
  const [size, setSize] = useState({ scale: 1, height: 800 });

  useEffect(() => {
    onReadyRef.current = onReady;
  });

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const scale = Math.min(1, entry.contentRect.width / MOCK_WIDTH);
      setSize({ scale, height: entry.contentRect.height / scale });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const iframe = frame.current!;
    const detach = attachLedgerline(iframe);
    const ready = () => {
      sendCommand({ cmd: "new_session" });
      onReadyRef.current?.();
    };
    iframe.addEventListener("load", ready);
    return () => {
      iframe.removeEventListener("load", ready);
      detach();
    };
  }, []);

  return (
    <div ref={wrap} className="relative h-full w-full overflow-clip border border-line bg-white">
      <iframe
        ref={frame}
        src={`/ledgerline/index.html?${query}`}
        title="ledgerline enterprise"
        style={{ width: MOCK_WIDTH, height: size.height, transform: `scale(${size.scale})`, transformOrigin: "0 0", border: 0 }}
      />
    </div>
  );
}
