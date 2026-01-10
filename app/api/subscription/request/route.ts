import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { SubscriptionTier } from "@prisma/client";

export const runtime = "nodejs";

type Body = {
  tier?: SubscriptionTier; // "basic" | "unlimited"
};

function json(status: number, body: any) {
  return NextResponse.json(body, { status });
}

function normalizeTier(raw: unknown): SubscriptionTier {
  const t = String(raw ?? "").toLowerCase().trim();
  return t === "unlimited" ? "unlimited" : "basic";
}

function getTierConfig(tier: SubscriptionTier) {
  const price =
    tier === "unlimited"
      ? Number(process.env.SUBSCRIPTION_UNLIMITED_PRICE_MX ?? "149")
      : Number(process.env.SUBSCRIPTION_BASIC_PRICE_MX ?? "99");

  const checkoutUrl =
    tier === "unlimited"
      ? process.env.SUBSCRIPTION_UNLIMITED_CHECKOUT_URL ?? ""
      : process.env.SUBSCRIPTION_BASIC_CHECKOUT_URL ?? "";

  return { price, checkoutUrl };
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) return json(401, { ok: false, message: "Unauthorized" });

  // ✅ 1) Tier desde querystring (PRIORIDAD)
  const { searchParams } = new URL(req.url);
  const tierFromQuery = searchParams.get("tier");

  // ✅ 2) Tier desde body (fallback)
  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    body = {};
  }

  // ✅ Prioridad: query > body
  const tier = normalizeTier(tierFromQuery ?? body.tier);

  const { price, checkoutUrl } = getTierConfig(tier);

  if (!checkoutUrl) {
    return json(500, {
      ok: false,
      message:
        tier === "unlimited"
          ? "Falta SUBSCRIPTION_UNLIMITED_CHECKOUT_URL en el env."
          : "Falta SUBSCRIPTION_BASIC_CHECKOUT_URL en el env.",
    });
  }

  // 1) Estado actual
  const sub = await prisma.userSubscription.findUnique({
    where: { userId },
    select: { status: true, tier: true },
  });

  // ✅ Si ya tiene unlimited aprobado, no permitir downgrade ni duplicar
  if (sub?.status === "approved" && sub.tier === "unlimited") {
    return json(200, {
      ok: true,
      status: "approved",
      tier: "unlimited",
      checkoutUrl: null,
      message:
        tier === "basic"
          ? "Ya tienes Pro Unlimited activo (no necesitas Pro Basic)."
          : "Ya tienes Pro Unlimited activo.",
    });
  }

  // ✅ Si ya tiene basic aprobado y pide basic, no hacer nada
  if (sub?.status === "approved" && sub.tier === "basic" && tier === "basic") {
    return json(200, {
      ok: true,
      status: "approved",
      tier: "basic",
      checkoutUrl: null,
      message: "Ya tienes Pro Basic activo.",
    });
  }

  // 2) Idempotencia: si ya hay pending para ESTE tier, reusar
  const pendingPurchase = await prisma.subscriptionPurchase.findFirst({
    where: { userId, status: "pending", tier },
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true, tier: true },
  });

  if (pendingPurchase) {
    // asegurar sub en pending (trust-first) al tier solicitado
    await prisma.userSubscription.upsert({
      where: { userId },
      create: { userId, status: "pending", tier },
      update: { status: "pending", tier },
    });

    return json(200, {
      ok: true,
      status: "pending",
      tier,
      purchaseId: pendingPurchase.id,
      checkoutUrl,
      message:
        "Ya tenías una solicitud pendiente para este plan. Acceso provisional habilitado.",
    });
  }

  // 3) Crear solicitud (purchase + subscription)
  const created = await prisma.$transaction(async (tx) => {
    const purchase = await tx.subscriptionPurchase.create({
      data: {
        userId,
        amountMx: price,
        status: "pending",
        tier,
      },
      select: { id: true },
    });

    await tx.userSubscription.upsert({
      where: { userId },
      create: { userId, status: "pending", tier },
      update: { status: "pending", tier },
    });

    return purchase;
  });

  return json(200, {
    ok: true,
    status: "pending",
    tier,
    purchaseId: created.id,
    checkoutUrl,
    message:
      tier === "unlimited"
        ? "Solicitud Pro Unlimited creada. Acceso provisional habilitado."
        : "Solicitud Pro Basic creada. Acceso provisional habilitado.",
  });
}
