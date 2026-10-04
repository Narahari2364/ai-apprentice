"use client";
// Top bar in Ledgerline's style: Ledgerline's logo and the modules (Capture · Mapping · Teaching · Review).

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopBar() {
  const path = usePathname();

  return (
    <header className="relative z-20 flex h-16 flex-none items-center border-b border-line bg-white px-4 sm:px-6">
      <Link href="/" className="flex flex-none items-center gap-2.5 text-[22px] tracking-tight text-[#1f2d3d] sm:text-[27px]" aria-label="ledgerline enterprise home">
        <Logo />
        <span>
          <b className="font-medium">ledgerline</b> <span className="font-light">enterprise</span>
        </span>
      </Link>

      <nav className="ml-auto flex h-full items-stretch gap-1 text-[15px]" aria-label="Modules">
        {[
          ["/capture", "1 · Capture"],
          ["/map", "2 · Mapping"],
          ["/teach", "3 · Teaching"],
          ["/review", "Review"],
        ].map(([href, label]) => {
          const on = path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center whitespace-nowrap border-b-[3px] px-2 sm:px-3 ${on ? "border-indigo font-medium text-indigo" : "border-transparent text-[#444] hover:text-indigo"}`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
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
