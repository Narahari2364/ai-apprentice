"use client";

import { useSyncExternalStore } from "react";
import WorkMapView from "@/features/workmap/WorkMapView";
import { sampleWorkMap } from "@/data/sampleWorkMap";
import type { WorkMap } from "@/lib/types";

const KEY = "apprentice.workmap";
const readRaw = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

export default function MapPage() {
  const raw = useSyncExternalStore(() => () => {}, readRaw, () => null);
  const map: WorkMap = raw ? JSON.parse(raw) : sampleWorkMap;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-3">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{raw ? "Work Map from your last capture session" : "Showing the sample Work Map (no session captured yet)"}</span>
        {raw && (
          <button
            className="underline"
            onClick={() => {
              localStorage.removeItem(KEY);
              location.reload();
            }}
          >
            Reset to sample
          </button>
        )}
      </div>
      <WorkMapView map={map} />
    </div>
  );
}
