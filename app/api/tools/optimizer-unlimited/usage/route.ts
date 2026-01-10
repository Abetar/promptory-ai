// app/api/tools/optimizer-unlimited/usage/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasUnlimitedSubscription } from "@/lib/subscription";

export const runtime = "nodejs";

/**
 * ✅ Ultimate daily limit (separado del optimizer normal)
 * Puedes moverlo a env cuando quieras:
 * PROMPT_UNLIMITED_DAILY_LIMIT=20
 */
const ULTIMATE_DAILY_LIMIT = Number(
  process.env.PROMPT_UNLIMITED_DAILY_LIMIT ?? "20"
);

function startOfTodayUTC() {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
}

function startOfTomorrowUTC() {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      0,
      0,
      0
    )
  );
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const hasUnlimited = await hasUnlimitedSubscription();
  if (!hasUnlimited) {
    return NextResponse.json(
      { ok: false, message: "Requiere Pro Unlimited." },
      { status: 403 }
    );
  }

  const from = startOfTodayUTC();

  /**
   * ✅ Fuente de verdad del Ultimate rate-limit:
   * contamos AuditEvent por event optimizer.ultimate.run
   * (esto evita mezclar con optimizer normal)
   */
  const usedToday = await prisma.auditEvent.count({
    where: {
      userId,
      event: "optimizer.ultimate.run",
      createdAt: { gte: from },
    },
  });

  const remaining = Math.max(0, ULTIMATE_DAILY_LIMIT - usedToday);

  return NextResponse.json({
    ok: true,
    tier: "unlimited",
    usedToday,
    dailyLimit: ULTIMATE_DAILY_LIMIT,
    remaining,
    resetsAt: startOfTomorrowUTC().toISOString(),
  });
}
