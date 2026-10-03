import Link from "next/link";

export default function Home() {
  return (
    <div className="h-full bg-panel">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
        <div>
          <h1 className="text-[31px] font-normal text-brand">The AI Apprentice</h1>
          <p className="mt-1 max-w-3xl text-[17px] text-[#444]">
            Captures what an expert knows while they work in Ledgerline, maps it into a Work Map anyone can follow, and teaches it to the next new hire.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <ModeCard
            href="/capture"
            bar="Expert mode"
            title="Paul Adler · Consultant"
            text="Submit meal expenses as usual. Click Apprentice in Ledgerline: it watches, stays quiet while you work, and asks why at natural pauses. Then it debriefs and builds the Work Map."
            cta="Start capture"
          />
          <ModeCard
            href="/teach"
            bar="New hire mode"
            title="Lena Brandt · Associate"
            text="Submit a new delivery-order expense with a voice tutor. It asks you to predict each step the way Paul does it and stops a wrong save before finance rejects it."
            cta="Start learning"
          />
        </div>
        <div className="card">
          <div className="section-title rounded-t-sm border-t-0">How it works</div>
          <ol className="grid gap-4 p-4 text-[14.5px] md:grid-cols-3">
            <li><b className="text-brand">1. Capture</b><br />Voice agent + screen events from Ledgerline. Questions only at natural pauses.</li>
            <li><b className="text-brand">2. Map</b><br />Debrief and teach-back become clickable steps, decisions, reasons and guardrails.</li>
            <li><b className="text-brand">3. Teach</b><br />The tutor checks every Save against Paul&apos;s guardrails and explains in his words.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function ModeCard({ href, bar, title, text, cta }: { href: string; bar: string; title: string; text: string; cta: string }) {
  return (
    <Link href={href} className="card group block transition hover:shadow-[0_0_0_1px_#2F74D0]">
      <div className="card-bar">{bar}</div>
      <div className="card-body">
        <div className="text-[19px]">{title}</div>
        <p className="mt-2 text-[14.5px] leading-relaxed text-[#444]">{text}</p>
        <span className="btn-pri mt-4">{cta} →</span>
      </div>
    </Link>
  );
}
