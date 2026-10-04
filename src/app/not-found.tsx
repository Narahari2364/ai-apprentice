import Link from "next/link";

// 404 in the same language as the home page.
export default function NotFound() {
  return (
    <section className="relative flex min-h-full items-center overflow-hidden bg-[linear-gradient(180deg,#f3f2ff_0%,#ffffff_100%)]">
      <div className="pointer-events-none absolute -right-32 -top-32 h-[440px] w-[440px] rounded-full bg-indigo/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-[320px] w-[320px] rounded-full bg-brand/10 blur-3xl" aria-hidden="true" />
      <div className="rise relative mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="mx-auto w-fit overflow-hidden rounded-sm border border-[#cfd2d8] bg-white text-left shadow-[0_14px_36px_rgba(20,28,38,.16)]">
          <div className="flex items-center gap-2 bg-indigo px-3 py-2 text-[13px] text-white">
            <svg width="16" height="14" viewBox="0 0 18 16" aria-hidden="true">
              <path d="M1.5 1.5h15v10H6L1.5 15z" fill="#fff" />
              <path d="M5 5h8M5 8h5" stroke="#5146d9" strokeWidth="1.4" />
            </svg>
            Apprentice
          </div>
          <p className="px-4 py-3 text-[15px]">Hmm, I haven&apos;t seen this page before. Where were you trying to go?</p>
        </div>
        <div className="mt-8 text-[72px] font-light leading-none tracking-tight text-indigo">404</div>
        <h1 className="mt-3 text-[28px] font-light text-[#1f2d3d]">This page isn&apos;t in the Work Map</h1>
        <p className="mt-2 text-[16px] text-[#475467]">The link may be old, or the page was never captured.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex h-11 items-center rounded-sm bg-indigo px-5 text-[15px] text-white shadow-sm transition hover:bg-indigo-dark">
            Back to home
          </Link>
          <Link href="/map" className="inline-flex h-11 items-center rounded-sm border border-brand bg-white px-5 text-[15px] text-brand transition hover:bg-brand-soft">
            Open the Work Map
          </Link>
        </div>
      </div>
    </section>
  );
}
