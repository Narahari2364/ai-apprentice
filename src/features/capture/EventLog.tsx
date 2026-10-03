"use client";
// Live log of ScreenEvents from the shared bus (Ledgerline events + vision).

import { useScreenEvents } from "@/lib/events";

export default function EventLog() {
  const events = useScreenEvents();
  return (
    <section className="card flex min-h-0 flex-1 flex-col">
      <div className="section-title flex items-center rounded-t-sm border-t-0">
        Live screen events <span className="ml-auto font-normal normal-case text-muted">{events.length}</span>
      </div>
      {events.length === 0 ? (
        <p className="p-3 text-[14px] text-muted">Work in Ledgerline to see events here.</p>
      ) : (
        <ol className="min-h-0 flex-1 overflow-y-auto text-[13px]">
          {[...events].reverse().map((e, i) => (
            <li key={events.length - i} className="flex gap-2 border-b border-[#eee] px-3 py-1.5 leading-snug">
              <span className="font-mono text-[11.5px] text-muted">{e.time}</span>
              <span className={`pill h-fit px-1.5 py-0 text-[11px] ${e.source === "vision" ? "bg-warn-soft text-[#7a5a00]" : "bg-brand-soft text-brand"}`}>{e.source}</span>
              <span className={e.type === "save_blocked" ? "text-err" : ""}>{e.description}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
