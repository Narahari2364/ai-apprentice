"use client";
// Top bar in Ledgerline's style: logo, Work Map link and mode switch.
// Hidden on /capture and /teach: there Ledgerline fills the screen with its own header,
// and the Apprentice lives in it.

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopBar() {
  const path = usePathname();
  if (path.startsWith("/capture") || path.startsWith("/teach")) return null;

  return (
    <header className="relative z-20 flex h-16 flex-none items-center border-b border-line bg-white px-6">
      <Link href="/" className="flex flex-none items-center gap-2.5 text-[24px] tracking-tight text-[#1f2d3d]">
        <Logo />
        <span>
          <b className="font-medium">AI</b> <span className="font-light">Apprentice</span>
        </span>
      </Link>

      <div className="ml-auto flex flex-none items-center gap-5">
        <Link
          href="/map"
          className={`whitespace-nowrap text-[15px] ${path.startsWith("/map") ? "font-medium text-brand" : "text-[#444] hover:text-brand"}`}
        >
          Work Map
        </Link>
        <div className="flex overflow-hidden rounded-sm border border-brand text-[14px]" role="group" aria-label="Mode">
          <Link href="/capture" className="bg-white px-3.5 py-1.5 text-brand hover:bg-brand-soft">
            Expert
          </Link>
          <Link href="/teach" className="border-l border-brand bg-white px-3.5 py-1.5 text-brand hover:bg-brand-soft">
            New hire
          </Link>
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <svg width="32" height="32" viewBox="0 0 34 34" aria-hidden="true">
      <rect width="34" height="34" rx="6" fill="#2F74D0" />
      <circle cx="17" cy="13" r="5" fill="none" stroke="#fff" strokeWidth="2.2" />
      <path d="M8 27c1.6-4.6 5-7 9-7s7.4 2.4 9 7" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M25 6.5l1.2 2.6 2.6 1.2-2.6 1.2L25 14.1l-1.2-2.6-2.6-1.2 2.6-1.2z" fill="#BFE3F8" />
    </svg>
  );
}
