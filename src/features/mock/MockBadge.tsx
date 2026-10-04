"use client";
// Small label so nobody mistakes mock mode for the live agent (e.g. in a recording).

import { useSyncExternalStore } from "react";
import { isMockMode } from "./mockMode";

const noop = () => () => {};

export default function MockBadge() {
  const on = useSyncExternalStore(noop, isMockMode, () => false);
  if (!on) return null;
  return (
    <a
      href="?mock=0"
      title="Turn mock mode off"
      className="fixed bottom-3 right-3 z-[70] rounded-sm border border-warn bg-warn-soft px-2.5 py-1 text-[12px] font-medium text-[#7a4a00] shadow-sm hover:underline"
    >
      Mock mode · scripted agent, fake data ✕
    </a>
  );
}
