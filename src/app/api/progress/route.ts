// GET / PUT /api/progress?workflow=<id>&learner=<name> — learned / relearn per step, merged on save.
import { NextResponse } from "next/server";
import { readJson, safe, writeJson } from "@/lib/db";
import type { StepMastery } from "@/lib/types";

export const dynamic = "force-dynamic";

const path = (req: Request) => {
  const q = new URL(req.url).searchParams;
  return `progress/${safe(q.get("workflow") ?? "none")}/${safe(q.get("learner") ?? "anonymous")}.json`;
};

export async function GET(req: Request) {
  return NextResponse.json((await readJson<Record<string, StepMastery>>(path(req))) ?? {});
}

export async function PUT(req: Request) {
  const patch = (await req.json()) as Record<string, StepMastery>;
  const p = path(req);
  const merged = { ...((await readJson<Record<string, StepMastery>>(p)) ?? {}), ...patch };
  await writeJson(p, merged);
  return NextResponse.json(merged);
}
