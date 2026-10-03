import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 py-12">
      <div>
        <h1 className="text-4xl font-bold">The AI Apprentice</h1>
        <p className="mt-2 text-lg text-slate-600">
          A voice agent that watches an expert work, asks why, builds a Work Map, and coaches the next new hire.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Link
          href="/capture"
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:border-sky-400 hover:shadow-md"
        >
          <div className="text-sm font-semibold uppercase tracking-wide text-sky-600">Expert mode</div>
          <div className="mt-2 text-2xl font-bold">Teach the apprentice</div>
          <p className="mt-2 text-slate-600">Process invoices while the agent watches and asks why. Then review the Work Map.</p>
        </Link>
        <Link
          href="/teach"
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:border-emerald-400 hover:shadow-md"
        >
          <div className="text-sm font-semibold uppercase tracking-wide text-emerald-600">New hire mode</div>
          <div className="mt-2 text-2xl font-bold">Learn from the expert</div>
          <p className="mt-2 text-slate-600">Work a new case while the tutor coaches you and stops you before a wrong save.</p>
        </Link>
      </div>
    </div>
  );
}
