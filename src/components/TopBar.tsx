"use client";
// Top bar in Ledgerline's style: Ledgerline's logo, Work Map link and mode switch.
// Hidden on /capture and /teach: there Ledgerline fills the screen with its own header,
// and the Apprentice lives in it.

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopBar() {
  const path = usePathname();
  if (path.startsWith("/capture") || path.startsWith("/teach")) return null; // full-screen Ledgerline

  return (
    <header className="relative z-20 flex h-16 flex-none items-center border-b border-line bg-white px-4 sm:px-6">
      <Link href="/" className="flex flex-none items-center gap-2.5 text-[22px] tracking-tight text-[#1f2d3d] sm:text-[27px]" aria-label="ledgerline enterprise home">
        <Logo />
        <span>
          <b className="font-medium">ledgerline</b> <span className="font-light">enterprise</span>
        </span>
      </Link>

      <div className="ml-auto flex flex-none items-center gap-3 sm:gap-5">
        <Link
          href="/map"
          className={`hidden whitespace-nowrap text-[15px] sm:inline ${path.startsWith("/map") ? "font-medium text-brand" : "text-[#444] hover:text-brand"}`}
        >
          Work Map
        </Link>
        <div className="flex overflow-hidden rounded-sm border border-brand text-[14px]" role="group" aria-label="Mode">
          <Link href="/learn" className="bg-white px-2.5 py-1.5 sm:px-3.5 text-brand hover:bg-brand-soft">
            Expert
          </Link>
          <Link href="/teach" className="border-l border-brand bg-white px-2.5 py-1.5 sm:px-3.5 text-brand hover:bg-brand-soft">
            New hire
          </Link>
        </div>
      </div>
    </header>
  );
}

/** Ledgerline's own logo (same as its header), so the app reads as one product. */
function Logo() {
  return (
    <svg width="32" height="32" viewBox="0 0 34 34" aria-hidden="true">
      <rect width="34" height="34" rx="6" fill="#2F8FE6" />
      <path d="M10 6.5h14v21l-2.33-1.6-2.33 1.6-2.34-1.6-2.33 1.6-2.34-1.6L10 27.5z" fill="#fff" />
      <path d="M13.5 12h7M13.5 16h7M13.5 20h4.5" stroke="#2F8FE6" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}
