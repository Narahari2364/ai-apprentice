"use client";
// Embeds Ledgerline (public/ledgerline/index.html, unchanged) and connects it to
// src/lib/ledgerline.ts. Ledgerline needs 1180px, so the frame is scaled to fit.
// - The iframe is absolutely positioned: in normal flow its unscaled height fed back
//   into the wrapper's size, the ResizeObserver grew it again, and the page flickered.
// - overflow-clip (not hidden): Ledgerline calls scrollIntoView, which would otherwise
//   scroll this same-origin wrapper sideways and cut off its left edge.
// - EMBED_CSS hides Ledgerline's own header and notices; our top bar replaces them.

import { useEffect, useRef, useState } from "react";
import { attachLedgerline, EMBED_CSS, sendCommand } from "@/lib/ledgerline";

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
      const height = Math.round(entry.contentRect.height / scale);
      setSize((s) => (s.scale === scale && s.height === height ? s : { scale, height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const iframe = frame.current!;
    const detach = attachLedgerline(iframe);
    const ready = () => {
      const doc = iframe.contentDocument;
      if (doc && !doc.getElementById("apprentice-embed")) {
        const style = doc.createElement("style");
        style.id = "apprentice-embed";
        style.textContent = EMBED_CSS;
        doc.head.appendChild(style);
      }
      sendCommand({ cmd: "new_session" });
      onReadyRef.current?.();
    };
    iframe.addEventListener("load", ready);
    if (iframe.contentDocument?.readyState === "complete" && iframe.contentWindow?.location.pathname.startsWith("/ledgerline")) ready();
    return () => {
      iframe.removeEventListener("load", ready);
      detach();
    };
  }, []);

  return (
    <div ref={wrap} className="relative h-full min-h-0 w-full overflow-clip border border-line bg-white">
      <iframe
        ref={frame}
        src={`/ledgerline/index.html?${query}`}
        title="Ledgerline"
        className="absolute left-0 top-0"
        style={{ width: MOCK_WIDTH, height: size.height, transform: `scale(${size.scale})`, transformOrigin: "0 0", border: 0 }}
      />
    </div>
  );
}
