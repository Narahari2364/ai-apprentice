"use client";
// Embeds Ledgerline (public/ledgerline/index.html) and connects it to src/lib/ledgerline.ts.
// - Ledgerline needs at least 1180px: narrower containers scale it down, wider ones get the full width.
// - The iframe is absolutely positioned: in normal flow its unscaled height fed back
//   into the wrapper's size, the ResizeObserver grew it again, and the page flickered.
// - overflow-clip (not hidden): Ledgerline calls scrollIntoView, which would otherwise
//   scroll this same-origin wrapper sideways and cut off its left edge.
// - embedCss() hides Ledgerline's notices (and its header in "view" mode); with
//   onApprenticeClick, an indigo "Apprentice" button is added to Ledgerline's top bar.

import { useEffect, useRef, useState } from "react";
import { attachLedgerline, embedCss, injectApprenticeButton, sendCommand, type EmbedMode } from "@/lib/ledgerline";

const MOCK_WIDTH = 1180;

interface Props {
  /** Query string for Ledgerline, e.g. "user=paul" or "user=maya&guard=1". */
  query: string;
  mode: EmbedMode;
  /** Adds the Apprentice button to Ledgerline's top bar. */
  onApprenticeClick?: () => void;
  /** Whether the Apprentice button shows as active. */
  apprenticeOn?: boolean;
  /** Called once Ledgerline has loaded and can take commands. */
  onReady?: () => void;
}

export default function LedgerlineFrame({ query, mode, onApprenticeClick, apprenticeOn = false, onReady }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const onReadyRef = useRef(onReady);
  const onClickRef = useRef(onApprenticeClick);
  const setButtonOn = useRef<((on: boolean) => void) | null>(null);
  const [size, setSize] = useState({ scale: 1, width: MOCK_WIDTH, height: 800 });

  useEffect(() => {
    onReadyRef.current = onReady;
    onClickRef.current = onApprenticeClick;
  });

  useEffect(() => {
    setButtonOn.current?.(apprenticeOn);
  }, [apprenticeOn]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      const scale = Math.min(1, w / MOCK_WIDTH);
      const next = { scale, width: Math.max(MOCK_WIDTH, Math.floor(w)), height: Math.round(h / scale) };
      setSize((s) => (s.scale === next.scale && s.width === next.width && s.height === next.height ? s : next));
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
        style.textContent = embedCss(mode);
        doc.head.appendChild(style);
        if (onClickRef.current) setButtonOn.current = injectApprenticeButton(doc, () => onClickRef.current?.());
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
  }, [mode]);

  return (
    <div ref={wrap} className="relative h-full min-h-0 w-full overflow-clip bg-white">
      <iframe
        ref={frame}
        src={`/ledgerline/index.html?${query}`}
        title="Ledgerline"
        className="absolute left-0 top-0"
        style={{ width: size.width, height: size.height, transform: `scale(${size.scale})`, transformOrigin: "0 0", border: 0 }}
      />
    </div>
  );
}
