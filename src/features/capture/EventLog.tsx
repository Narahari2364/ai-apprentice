"use client";
// Owner: CS 1. Live log of ScreenEvents from the shared bus.

import { useScreenEvents } from "@/lib/events";

export default function EventLog() {
  const events = useScreenEvents();
  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Live screen events ({events.length})
      </h3>
      {events.length === 0 ? (
        <p className="text-slate-400">Open an invoice in the ERP to see events here.</p>
      ) : (
        <ol className="flex-1 space-y-1 overflow-y-auto font-mono text-sm">
          {[...events].reverse().map((e, i) => (
            <li key={events.length - i} className="border-b border-slate-100 py-1">
              <span className="text-slate-400">{e.time}</span>{" "}
              <span className="rounded bg-slate-100 px-1 text-xs">{e.source}</span>{" "}
              {e.description}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
