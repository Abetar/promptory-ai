"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";

export type ActionState =
  | { ok: true; message?: string }
  | { ok: false; message: string };

export async function approveSubscriptionPurchaseAction(
  purchaseId: string
): Promise<ActionState> {
  try {
    await requireAdmin();

    await prisma.$transaction(async (tx) => {
      const purchase = await tx.subscriptionPurchase.findUnique({
        where: { id: purchaseId },
        select: { id: true, status: true, userId: true },
      });

      if (!purchase) throw new Error("Purchase not found");

      // idempotente
      if (purchase.status === "approved") return;

      // regla: si ya la rechazaste, no apruebes encima
      if (purchase.status === "rejected") {
        throw new Error("Purchase already rejected");
      }

      // pending -> approved
      await tx.subscriptionPurchase.update({
        where: { id: purchaseId },
        data: {
          status: "approved",
          approvedAt: new Date(),
          rejectedAt: null,
          // opcional: snapshot de vigencia
          startsAt: new Date(),
          endsAt: null,
        },
      });

      // asegurar UserSubscription approved (ya existía pending)
      await tx.userSubscription.upsert({
        where: { userId: purchase.userId },
        create: {
          userId: purchase.userId,
          status: "approved",
          startsAt: new Date(),
          endsAt: null,
        },
        update: {
          status: "approved",
          startsAt: new Date(),
          endsAt: null,
        },
      });
    });

    revalidatePath("/dashboard/admin/subscriptions");
    revalidatePath("/dashboard/upgrade");
    revalidatePath("/dashboard/tools/prompt-optimizer");
    return { ok: true, message: "Suscripción aprobada ✅" };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "No se pudo aprobar." };
  }
}

export async function rejectSubscriptionPurchaseAction(
  purchaseId: string
): Promise<ActionState> {
  try {
    await requireAdmin();

    await prisma.$transaction(async (tx) => {
      const purchase = await tx.subscriptionPurchase.findUnique({
        where: { id: purchaseId },
        select: { id: true, status: true, userId: true },
      });

      if (!purchase) throw new Error("Purchase not found");

      // idempotente
      if (purchase.status === "rejected") {
        // asegurar revocación
        await tx.userSubscription.upsert({
          where: { userId: purchase.userId },
          create: { userId: purchase.userId, status: "rejected" },
          update: { status: "rejected", endsAt: new Date() },
        });
        return;
      }

      // regla: si ya la aprobaste, no rechaces encima
      if (purchase.status === "approved") {
        throw new Error("Purchase already approved");
      }

      // pending -> rejected
      await tx.subscriptionPurchase.update({
        where: { id: purchaseId },
        data: {
          status: "rejected",
          rejectedAt: new Date(),
          approvedAt: null,
        },
      });

      // ✅ revocar acceso provisional
      await tx.userSubscription.upsert({
        where: { userId: purchase.userId },
        create: {
          userId: purchase.userId,
          status: "rejected",
          endsAt: new Date(),
        },
        update: {
          status: "rejected",
          endsAt: new Date(),
        },
      });
    });

    revalidatePath("/dashboard/admin/subscriptions");
    revalidatePath("/dashboard/upgrade");
    revalidatePath("/dashboard/tools/prompt-optimizer");
    return { ok: true, message: "Suscripción rechazada ✅ (acceso revocado)" };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "No se pudo rechazar." };
  }
}
