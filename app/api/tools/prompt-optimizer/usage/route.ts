// app/api/tools/prompt-optimizer/usage/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasActiveSubscription } from "@/lib/subscription";

export const runtime = "nodejs";

/**
 * Free limits:
 * - Ajustable por env: PROMPT_OPTIMIZER_FREE_DAILY_LIMIT
 */
const FREE_DAILY_LIMIT = Number(process.env.PROMPT_OPTIMIZER_FREE_DAILY_LIMIT ?? "10");

function startOfTodayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
}

function nextResetUTC() {
  const now = new Date();
  // siguiente 00:00 UTC
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const hasSub = await hasActiveSubscription();
  const plan: "free" | "pro" = hasSub ? "pro" : "free";

  const from = startOfTodayUTC();
  const usedToday = await prisma.promptOptimizerRun.count({
    where: {
      userId,
      plan, // cuenta los runs del plan actual (match con el limiter)
      createdAt: { gte: from },
    },
  });

  const resetsAt = nextResetUTC();

  return NextResponse.json({
    ok: true,
    plan,
    usedToday,
    dailyLimit: plan === "free" ? FREE_DAILY_LIMIT : null,
    resetsAt: resetsAt.toISOString(), // UTC
  });
}
