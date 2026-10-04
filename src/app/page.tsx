import Link from "next/link";
import type { ReactNode } from "react";

// Landing page: the problem, the product in one picture, the three modules, the two
// people in the demo, and how trust is handled. Ledgerline blue + Apprentice indigo.

export default function Home() {
  return (
    <div className="bg-white">
      <Hero />
      <Stats />
      <HowItWorks />
      <People />
      <Trust />
      <Footer />
    </div>
  );
}

/* ---------------- hero ---------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-[linear-gradient(180deg,#f6f8fc_0%,#ffffff_100%)]">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-indigo/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-32 top-48 h-[380px] w-[380px] rounded-full bg-brand/10 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-28 pt-16 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
        <div className="rise">
          <span className="inline-flex items-center gap-2 rounded-sm border border-indigo/30 bg-indigo-soft px-2.5 py-1 text-[12.5px] font-bold uppercase tracking-wide text-indigo">
            Hack-Nation × ElevenLabs · Challenge 01
          </span>
          <h1 className="mt-5 text-[36px] font-light leading-[1.08] tracking-tight text-[#1f2d3d] sm:text-[44px] md:text-[54px]">
            When experts leave,
            <br />
            <span className="font-medium text-indigo">their judgment stays.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[18px] leading-relaxed text-[#444]">
            The AI Apprentice watches an expert work, asks <i>why</i> at the right moment, turns the answers into a Work Map,
            and coaches the next new hire in the expert&apos;s own words.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/capture" className="inline-flex h-12 items-center gap-2 rounded-sm bg-indigo px-6 text-[16px] text-white shadow-sm transition hover:bg-indigo-dark">
              Start as Paul <span className="opacity-80">· expert</span> →
            </Link>
            <Link href="/teach" className="inline-flex h-12 items-center gap-2 rounded-sm border border-brand bg-white px-6 text-[16px] text-brand transition hover:bg-brand-soft">
              Start as Maya <span className="opacity-80">· new hire</span>
            </Link>
          </div>
          <Link href="/map" className="mt-4 inline-block text-[15px] text-brand hover:underline">
            or look at the Work Map first →
          </Link>
        </div>

        <ProductShot />
      </div>
    </section>
  );
}

/** A small, CSS-only picture of the product: Ledgerline with the Apprentice asking a question. */
function ProductShot() {
  return (
    <div className="rise relative" style={{ animationDelay: "120ms" }}>
      <div className="overflow-hidden rounded-md border border-[#d5d9de] bg-white shadow-[0_24px_60px_rgba(31,45,61,.18)]">
        <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
          <span className="grid h-6 w-6 place-items-center rounded bg-[#2F8FE6] text-[11px] font-bold text-white">L</span>
          <span className="text-[15px]"><b className="font-medium">ledgerline</b> <span className="font-light">enterprise</span></span>
          <span className="ml-auto rounded-sm border border-indigo bg-indigo-soft px-2 py-0.5 text-[12px] text-indigo">Apprentice</span>
        </div>
        <div className="grid grid-cols-[1fr_1.1fr]">
          <div className="border-r border-line bg-panel p-3">
            <div className="rounded-sm bg-brand px-3 py-2 text-[12px] text-white">Expenses for Paul Adler</div>
            {[
              ["Trattoria da Lupo", "25.00", false],
              ["Brauhaus Kesselmann", "40.00", true],
              ["Bitebox · Saigon Kitchen", "26.78", false],
            ].map(([name, amt, sel]) => (
              <div key={name as string} className={`mt-1.5 flex items-center justify-between rounded-sm px-2 py-1.5 text-[12px] ${sel ? "bg-brand-soft" : "bg-white"}`}>
                <span className="truncate">{name}</span>
                <span className="font-mono">{amt}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1.5 p-3 text-[12px]">
            {[["Spent", "40.00 EUR"], ["Restaurant", "Brauhaus Kesselmann"], ["Guests", "1 · Paul Adler"]].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-[#eef0f3] pb-1">
                <span className="text-[#666]">{k}</span>
                <span>{v}</span>
              </div>
            ))}
            <div className="rounded-sm border-2 border-indigo bg-indigo-soft px-2 py-1.5">
              <div className="text-[#666]">Attachments</div>
              <div className="mt-0.5 truncate">receipt.jpg · approval-screenshot.png</div>
            </div>
          </div>
        </div>
      </div>

      {/* the Apprentice asking at a pause */}
      <div className="floaty absolute -bottom-24 -left-4 w-[300px] overflow-hidden rounded-sm border border-[#cfd2d8] bg-white shadow-[0_14px_36px_rgba(20,28,38,.22)] sm:-left-10">
        <div className="flex items-center gap-2 bg-indigo px-3 py-2 text-[13px] text-white">
          <BubbleIcon /> Apprentice
          <span className="ml-auto rounded-sm border border-white/70 px-1.5 text-[10px] font-bold">LEARNING MODE</span>
        </div>
        <p className="px-3 pt-2.5 text-[14px] leading-snug">You added a screenshot on this one that wasn&apos;t on the first one. What&apos;s that for?</p>
        <div className="flex items-center gap-2 px-3 pb-2.5 pt-2 text-[12.5px] text-indigo">
          <Wave /> Listening…
        </div>
      </div>
    </div>
  );
}

/* ---------------- stats ---------------- */

function Stats() {
  const stats = [
    ["11,200", "Americans turn 65 every day"],
    ["30%", "of Germany's workforce passes retirement age by 2036"],
    ["1.6 bn", "people aged 65+ worldwide by 2050"],
  ];
  return (
    <section className="border-b border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 pb-10 pt-16 sm:grid-cols-3">
        {stats.map(([n, label], i) => (
          <div key={n} className="rise border-l-[3px] border-brand pl-4" style={{ animationDelay: `${200 + i * 80}ms` }}>
            <div className="text-[36px] font-light leading-none text-[#1f2d3d]">{n}</div>
            <div className="mt-1.5 text-[14.5px] text-[#555]">{label}</div>
          </div>
        ))}
      </div>
      <p className="mx-auto max-w-6xl px-6 pb-10 text-[15px] text-[#666]">
        Decades of judgment walk out of the door, and screen recordings only show <i>what</i> happened, never <i>why</i>.
      </p>
    </section>
  );
}

/* ---------------- how it works ---------------- */

function HowItWorks() {
  const modules: { n: string; mode: string; title: string; who: string; text: string; points: string[]; icon: ReactNode; href: string }[] = [
    {
      n: "1",
      mode: "Learning mode",
      title: "Capture",
      who: "Paul works, the Apprentice listens",
      text: "It watches Ledgerline, stays quiet while Paul types, reads or talks, and asks one short question at a natural pause.",
      points: ["Questions about what's on screen", "At least one about a guardrail", "Off the record any time"],
      icon: <IconCapture />,
      href: "/capture",
    },
    {
      n: "2",
      mode: "Review mode",
      title: "Map",
      who: "Paul confirms what it learned",
      text: "A short debrief closes the gaps, the Apprentice explains it all back, and Paul says “yes, that's how it works”.",
      points: ["Steps, decisions, reasons in his words", "Guardrails typed: limit, rule, exception, stop", "Export for AI agents"],
      icon: <IconMap />,
      href: "/map",
    },
    {
      n: "3",
      mode: "Teaching mode",
      title: "Teach",
      who: "Maya practises a new case",
      text: "The tutor asks Maya to predict each decision and holds a wrong save before it happens, replaying Paul's moment.",
      points: ["A case Paul never showed", "Mistake caught before it's saved", "What she mastered, what to practise"],
      icon: <IconTeach />,
      href: "/teach",
    },
  ];
  return (
    <section className="bg-panel">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <SectionHead eyebrow="How it works" title="An apprentice, not a recorder" sub="Three modules, one product, inside the tool people already use." />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {modules.map((m, i) => (
            <Link
              key={m.n}
              href={m.href}
              className="rise group relative flex flex-col rounded-sm border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:border-indigo hover:shadow-[0_12px_30px_rgba(81,70,217,.12)]"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-md bg-indigo-soft text-indigo">{m.icon}</span>
                <div>
                  <div className="text-[12px] font-bold uppercase tracking-wide text-indigo">{m.n} · {m.mode}</div>
                  <div className="text-[22px] leading-tight">{m.title}</div>
                </div>
              </div>
              <div className="mt-4 text-[14px] font-medium text-[#1f2d3d]">{m.who}</div>
              <p className="mt-1.5 text-[15px] leading-relaxed text-[#555]">{m.text}</p>
              <ul className="mt-4 space-y-1.5 text-[14px]">
                {m.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="text-ok">✓</span> {p}
                  </li>
                ))}
              </ul>
              <span className="mt-auto pt-5 text-[14.5px] text-indigo group-hover:underline">Open {m.title} →</span>
              {i < 2 && (
                <span className="absolute -right-4 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-indigo lg:grid" aria-hidden="true">
                  →
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- people ---------------- */

function People() {
  return (
    <section className="border-y border-line bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <SectionHead eyebrow="The demo" title="Two people, one set of rules" sub="Meal expenses at Nordhaven Consulting. Paul never gets one rejected; Maya started this week." />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Persona
            initials="PA"
            color="bg-[#0f766e]"
            name="Paul Adler"
            role="Consultant · the expert"
            quote="Over 30 a person, I need proof my supervisor actually signed off."
            rules={["Over 30 per person → supervisor approval", "Delivery apps → receipt and tax invoice", "Restaurant receipts are enough on their own"]}
            cta="Show the Apprentice how it's done"
            href="/capture"
            accent="indigo"
          />
          <Persona
            initials="MC"
            color="bg-[#c2410c]"
            name="Maya Chen"
            role="Associate, week 1 · the new hire"
            quote="…oh, it's over 30, so I need the supervisor approval screenshot too."
            rules={["New case: a 35 delivery dinner", "Predicts each step before acting", "Wrong save held, explained in Paul's words"]}
            cta="Practise with the tutor"
            href="/teach"
            accent="brand"
          />
        </div>
      </div>
    </section>
  );
}

function Persona(p: { initials: string; color: string; name: string; role: string; quote: string; rules: string[]; cta: string; href: string; accent: "indigo" | "brand" }) {
  const accent = p.accent === "indigo" ? "border-indigo text-indigo hover:bg-indigo-soft" : "border-brand text-brand hover:bg-brand-soft";
  return (
    <div className="flex flex-col rounded-sm border border-line bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,.04)]">
      <div className="flex items-center gap-4">
        <span className={`grid h-14 w-14 place-items-center rounded-full text-[18px] font-medium text-white ${p.color}`}>{p.initials}</span>
        <div>
          <div className="text-[20px]">{p.name}</div>
          <div className="text-[14px] text-[#555]">{p.role}</div>
        </div>
      </div>
      <blockquote className="mt-5 border-l-[3px] border-indigo pl-4 text-[17px] italic leading-snug text-[#1f2d3d]">“{p.quote}”</blockquote>
      <ul className="mt-5 space-y-2 text-[14.5px]">
        {p.rules.map((r) => (
          <li key={r} className="flex gap-2.5">
            <span className="mt-[7px] h-1.5 w-1.5 flex-none rotate-45 bg-indigo" /> {r}
          </li>
        ))}
      </ul>
      <Link href={p.href} className={`mt-6 inline-flex h-11 w-fit items-center rounded-sm border bg-white px-5 text-[15px] transition ${accent}`}>
        {p.cta} →
      </Link>
    </div>
  );
}

/* ---------------- trust ---------------- */

function Trust() {
  const items = [
    ["Off the record", "One click, or just say it. Nothing is saved and the Work Map shows a gap."],
    ["Personal data hidden", "Names, emails, phone, card and tax numbers are removed before any AI sees them."],
    ["This window only", "The Apprentice watches Ledgerline, nothing else on the screen. Events, not video."],
    ["The expert approves", "Nobody learns from the Work Map until Paul publishes it to the tutor."],
  ];
  return (
    <section className="bg-panel">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <SectionHead eyebrow="Trust" title="Built so experts are happy to share" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(([t, d]) => (
            <div key={t} className="rounded-sm border border-line bg-white p-5">
              <div className="mb-2 grid h-9 w-9 place-items-center rounded-full bg-ok-soft text-ok">✓</div>
              <div className="text-[16px] font-medium">{t}</div>
              <p className="mt-1 text-[14px] leading-relaxed text-[#555]">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-6 text-[13.5px] text-[#666]">
        <span>
          <b className="font-medium text-[#1f2d3d]">AI Apprentice</b> · Hack-Nation × ElevenLabs, 7th Global AI Hackathon
        </span>
        <span className="sm:ml-auto">Built with ElevenLabs Agents · Gemini · Next.js · Ledgerline (mock data)</span>
      </div>
    </footer>
  );
}

/* ---------------- small pieces ---------------- */

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="max-w-2xl">
      <div className="text-[12.5px] font-bold uppercase tracking-[.14em] text-brand">{eyebrow}</div>
      <h2 className="mt-2 text-[32px] font-light leading-tight text-[#1f2d3d]">{title}</h2>
      {sub && <p className="mt-2 text-[16px] text-[#555]">{sub}</p>}
    </div>
  );
}

function Wave() {
  return (
    <span className="inline-flex h-4 items-end gap-[3px]" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="wave-bar w-[3px] rounded-sm bg-indigo" style={{ height: 14, animationDelay: `${i * 130}ms` }} />
      ))}
    </span>
  );
}

function BubbleIcon() {
  return (
    <svg width="16" height="14" viewBox="0 0 18 16" aria-hidden="true">
      <path d="M1.5 1.5h15v10H6L1.5 15z" fill="#fff" />
      <path d="M5 5h8M5 8h5" stroke="#5146d9" strokeWidth="1.4" />
    </svg>
  );
}

function IconCapture() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M8 20h8M12 16v4" strokeLinecap="round" />
      <path d="M9 9.5l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconMap() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="5" cy="12" r="2" />
      <path d="M12 9.5l2.5 2.5-2.5 2.5-2.5-2.5z" fill="currentColor" />
      <circle cx="19" cy="12" r="2" />
      <path d="M7 12h2.5M14.5 12H17" strokeLinecap="round" />
    </svg>
  );
}

function IconTeach() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M2 9l10-5 10 5-10 5z" strokeLinejoin="round" />
      <path d="M6 11v5c3 2.5 9 2.5 12 0v-5" strokeLinejoin="round" />
    </svg>
  );
}
