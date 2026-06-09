import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Health + keep-warm endpoint. Pinging this on a schedule keeps the Next server
// function warm and (via the SELECT 1) prevents Neon's compute from auto-suspending,
// which is the main cause of the intermittent multi-second cold-start loads.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const start = Date.now();
  let db: "ok" | "error" = "ok";

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    db = "error";
  }

  return NextResponse.json(
    { ok: db === "ok", db, dbMs: Date.now() - start },
    {
      status: db === "ok" ? 200 : 503,
      headers: { "Cache-Control": "no-store, max-age=0" }
    }
  );
}
