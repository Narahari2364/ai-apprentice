// GET / PUT / DELETE /api/workflows/<id> — one trained workflow in the database
// (steps, the expert's reasons and rules, screenshots, approval state).
import { NextResponse } from "next/server";
import { readJson, remove, safe, writeJson } from "@/lib/db";
import type { WorkflowRecord, WorkflowSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };
const INDEX = "workflows/index.json";

const summary = (w: WorkflowRecord): WorkflowSummary => ({
  id: w.id,
  name: w.name,
  createdAt: w.createdAt,
  published: !!w.map.published,
  stepCount: w.map.steps.length,
});

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const record = await readJson<WorkflowRecord>(`workflows/${safe(id)}.json`);
  return record ? NextResponse.json(record) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  const record = (await req.json()) as WorkflowRecord;
  if (!record?.map?.steps || record.id !== id) return NextResponse.json({ error: "Bad workflow" }, { status: 400 });
  await writeJson(`workflows/${safe(id)}.json`, record);
  const index = (await readJson<WorkflowSummary[]>(INDEX)) ?? [];
  await writeJson(INDEX, [summary(record), ...index.filter((w) => w.id !== id)]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  await remove(`workflows/${safe(id)}.json`);
  const index = (await readJson<WorkflowSummary[]>(INDEX)) ?? [];
  await writeJson(INDEX, index.filter((w) => w.id !== id));
  return NextResponse.json({ ok: true });
}
