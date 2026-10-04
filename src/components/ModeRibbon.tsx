"use client";
// Slim ribbon above Ledgerline on /capture and /teach: which mode, who, and the way
// home / to the Work Map / to the other mode. Ledgerline below stays untouched.

import Link from "next/link";

interface Props {
  mode: "learning" | "teaching";
}

export default function ModeRibbon({ mode }: Props) {
  const learning = mode === "learning";
  return (
    <div className="flex h-9 flex-none items-center gap-3 bg-[linear-gradient(90deg,#3f35b8_0%,#5146d9_55%,#2F74D0_100%)] px-4 text-[13px] text-white">
      <Link href="/" className="flex items-center gap-1.5 font-medium hover:opacity-90" title="AI Apprentice home">
        <svg width="16" height="14" viewBox="0 0 18 16" aria-hidden="true">
          <path d="M1.5 1.5h15v10H6L1.5 15z" fill="#fff" />
          <path d="M5 5h8M5 8h5" stroke="#5146d9" strokeWidth="1.4" />
        </svg>
        AI Apprentice
      </Link>
      <span className="opacity-40">|</span>
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#a5f3c4]" aria-hidden="true" />
        {learning ? "Learning mode · Module 1" : "Teaching mode · Module 3"}
      </span>
      <span className="hidden opacity-80 sm:inline">
        {learning ? "Expert: Paul Adler shows the task" : "New hire: Maya Chen practises a case Paul never showed"}
      </span>
      <span className="ml-auto flex items-center gap-4">
        <Link href="/map" className="opacity-90 hover:underline hover:opacity-100">Work Map</Link>
        <Link
          href={learning ? "/teach" : "/capture"}
          className="rounded-sm border border-white/50 px-2 py-0.5 opacity-95 transition hover:bg-white/10"
        >
          Switch to {learning ? "New hire" : "Expert"} →
        </Link>
      </span>
    </div>
  );
}
