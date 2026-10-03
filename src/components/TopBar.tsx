"use client";
// Top bar in Ledgerline's style. Ledgerline's own header is hidden inside the embed,
// so its main menu (Home, Expense Reports, Drafts, Submitted, Receipt Gallery) lives
// here, beside the logo, on pages that show Ledgerline.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LEDGERLINE_MENU, ledgerlineAction } from "@/lib/ledgerline";

const COMPANY = "Nordhaven Consulting Group";

export default function TopBar() {
  const path = usePathname();
  const mode = path.startsWith("/teach") ? "newhire" : path === "/" ? null : "expert";
  const user = mode === "newhire" ? "Lena Brandt" : mode === "expert" ? "Sabine Keller" : null;
  const showMenu = path.startsWith("/capture") || path.startsWith("/teach");

  return (
    <header className="relative z-20 flex h-16 flex-none items-center border-b border-line bg-white px-6">
      <Link href="/" className="flex flex-none items-center gap-2.5 text-[24px] tracking-tight text-[#1f2d3d]">
        <Logo />
        <span>
          <b className="font-medium">AI</b> <span className="font-light">Apprentice</span>
        </span>
      </Link>

      {showMenu && (
        <nav className="ml-8 flex h-full items-stretch" aria-label="Expenses menu">
          {LEDGERLINE_MENU.map((m) => (
            <button
              key={m.label}
              onClick={() => ledgerlineAction(m.action, m.data)}
              className="flex items-center whitespace-nowrap border-b-[3px] border-transparent px-2.5 text-[15px] text-[#444] hover:border-brand hover:text-brand"
            >
              {m.label}
            </button>
          ))}
        </nav>
      )}

      <div className="ml-auto flex flex-none items-center gap-5">
        <Link
          href="/map"
          className={`whitespace-nowrap text-[15px] ${path.startsWith("/map") ? "font-medium text-brand" : "text-[#444] hover:text-brand"}`}
        >
          Work Map
        </Link>
        <div className="flex overflow-hidden rounded-sm border border-brand text-[14px]" role="group" aria-label="Mode">
          <Link href="/capture" className={`px-3.5 py-1.5 ${mode === "expert" && !path.startsWith("/map") ? "bg-brand text-white" : "bg-white text-brand hover:bg-brand-soft"}`}>
            Expert
          </Link>
          <Link href="/teach" className={`border-l border-brand px-3.5 py-1.5 ${mode === "newhire" ? "bg-brand text-white" : "bg-white text-brand hover:bg-brand-soft"}`}>
            New hire
          </Link>
        </div>
        {user && (
          <div className="text-right leading-tight">
            <div className="text-[15px]">{user}</div>
            <div className="text-[12px] text-[#444]">{COMPANY}</div>
          </div>
        )}
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
