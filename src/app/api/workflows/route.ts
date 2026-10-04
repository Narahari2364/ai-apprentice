// GET /api/workflows — summaries of every trained workflow in the database.
import { NextResponse } from "next/server";
import { readJson } from "@/lib/db";
import type { WorkflowSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const index = (await readJson<WorkflowSummary[]>("workflows/index.json")) ?? [];
  return NextResponse.json(index);
}
