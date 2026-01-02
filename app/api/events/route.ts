// app/api/events/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logEvent } from "@/lib/audit";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

type AllowedEvent = "prompt.copy";

function toSafeJson(value: unknown): Prisma.InputJsonValue | null {
  if (value == null) return null;

  try {
    // ✅ Garantiza JSON serializable (sin undefined, funciones, clases, etc.)
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const email = session?.user?.email ?? null;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = body?.event as AllowedEvent | undefined;
  const entityType = (body?.entityType as string | undefined) ?? "prompt";
  const entityId = (body?.entityId as string | undefined) ?? null;

  // ✅ allowlist mínimo (evita abuso)
  const allowed: AllowedEvent[] = ["prompt.copy"];
  if (!event || !allowed.includes(event)) {
    return NextResponse.json({ error: "Event not allowed" }, { status: 400 });
  }

  const safeMeta = toSafeJson(body?.meta);

  await logEvent({
    userId,
    email,
    event,
    entityType,
    entityId,
    meta: safeMeta,
  });

  return NextResponse.json({ ok: true });
}
