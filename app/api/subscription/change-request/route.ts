// app/api/subscription/change-request/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function json(status: number, body: any) {
  return NextResponse.json(body, { status });
}

type Body = {
  type: "cancel" | "downgrade";
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const email = session?.user?.email ?? null;

  if (!userId) return json(401, { ok: false, message: "Unauthorized" });

  let body: Body | null = null;
  try {
    body = (await req.json()) as Body;
  } catch {
    body = null;
  }

  const type = body?.type;
  if (type !== "cancel" && type !== "downgrade") {
    return json(400, { ok: false, message: "Invalid type" });
  }

  const sub = await prisma.userSubscription.findUnique({
    where: { userId },
    select: { status: true, tier: true },
  });

  const status = (sub?.status ?? "").toLowerCase();
  const hasPro = status === "pending" || status === "approved";
  if (!hasPro) {
    return json(400, {
      ok: false,
      message: "No tienes una suscripción activa/provisional.",
    });
  }

  if (type === "downgrade" && sub?.tier !== "unlimited") {
    return json(400, {
      ok: false,
      message: "Solo puedes hacer downgrade si tienes Unlimited.",
    });
  }

  const existing = await prisma.subscriptionChangeRequest.findFirst({
    where: { userId, status: "pending", type },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  if (existing) {
    await prisma.auditEvent.create({
      data: {
        userId,
        emailSnapshot: email,
        event: "subscription_change_request_reused",
        entityType: "SubscriptionChangeRequest",
        entityId: existing.id,
        meta: { type },
      },
    });

    return json(200, {
      ok: true,
      requestId: existing.id,
      message: "Ya tenías una solicitud pendiente. La volvimos a usar.",
    });
  }

  const fromTier = sub?.tier ?? "basic";
  const toTier = type === "downgrade" ? "basic" : null;

  const created = await prisma.subscriptionChangeRequest.create({
    data: {
      userId,
      email,     // ✅ null permitido
      type,
      fromTier,
      toTier,    // ✅ null permitido
      status: "pending",
    },
    select: { id: true },
  });

  await prisma.auditEvent.create({
    data: {
      userId,
      emailSnapshot: email,
      event: "subscription_change_request_created",
      entityType: "SubscriptionChangeRequest",
      entityId: created.id,
      meta: { type, fromTier, toTier },
    },
  });

  return json(200, {
    ok: true,
    requestId: created.id,
    message:
      type === "cancel"
        ? "Solicitud de cancelación creada. Un admin la revisará."
        : "Solicitud de downgrade creada. Un admin la revisará.",
  });
}
