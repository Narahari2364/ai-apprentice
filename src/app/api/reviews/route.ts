// GET / PUT /api/reviews — the supervisor's review batch (items Teaching flagged as "might differ").
import { NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/db";
import type { ReviewBatch } from "@/lib/types";

export const dynamic = "force-dynamic";

const PATH = "reviews/current.json";

export async function GET() {
  return NextResponse.json(await readJson<ReviewBatch>(PATH));
}

export async function PUT(req: Request) {
  const batch = (await req.json()) as ReviewBatch;
  await writeJson(PATH, batch);
  return NextResponse.json({ ok: true });
}
