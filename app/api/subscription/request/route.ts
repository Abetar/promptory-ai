import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * Config
 * - SUBSCRIPTION_PRICE_MX: monto a mostrar/registrar (MVP)
 * - SUBSCRIPTION_CHECKOUT_URL: tu link de MercadoPago (o donde cobres)
 */
const SUBSCRIPTION_PRICE_MX = Number(process.env.SUBSCRIPTION_PRICE_MX ?? "199");
const SUBSCRIPTION_CHECKOUT_URL = process.env.SUBSCRIPTION_CHECKOUT_URL ?? "";

function json(status: number, body: any) {
  return NextResponse.json(body, { status });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) return json(401, { ok: false, message: "Unauthorized" });

  // Si no has seteado el link, mejor avisar (para que no “parezca” que falla)
  if (!SUBSCRIPTION_CHECKOUT_URL) {
    return json(500, {
      ok: false,
      message: "Falta SUBSCRIPTION_CHECKOUT_URL en el env.",
    });
  }

  // 1) Revisa sub actual
  const sub = await prisma.userSubscription.findUnique({
    where: { userId },
    select: { status: true },
  });

  if (sub?.status === "approved") {
    return json(200, {
      ok: true,
      status: "approved",
      checkoutUrl: null,
      message: "Ya tienes Pro activo.",
    });
  }

  // 2) Si ya hay compra pending, regresarla (idempotente)
  const pendingPurchase = await prisma.subscriptionPurchase.findFirst({
    where: { userId, status: "pending" },
    orderBy: { createdAt: "desc" },
    select: { id: true, status: true, createdAt: true },
  });

  if (pendingPurchase) {
    // asegura sub en pending (por si no existía)
    await prisma.userSubscription.upsert({
      where: { userId },
      create: { userId, status: "pending" },
      update: { status: "pending" },
    });

    return json(200, {
      ok: true,
      status: "pending",
      purchaseId: pendingPurchase.id,
      checkoutUrl: SUBSCRIPTION_CHECKOUT_URL,
      message: "Ya tenías una solicitud pendiente. Te damos acceso provisional.",
    });
  }

  // 3) Crear nueva solicitud (purchase + subscription)
  const created = await prisma.$transaction(async (tx) => {
    const purchase = await tx.subscriptionPurchase.create({
      data: {
        userId,
        amountMx: SUBSCRIPTION_PRICE_MX,
        status: "pending",
      },
      select: { id: true },
    });

    await tx.userSubscription.upsert({
      where: { userId },
      create: { userId, status: "pending" },
      update: { status: "pending" },
    });

    return purchase;
  });

  return json(200, {
    ok: true,
    status: "pending",
    purchaseId: created.id,
    checkoutUrl: SUBSCRIPTION_CHECKOUT_URL,
    message: "Solicitud creada. Acceso provisional habilitado.",
  });
}
