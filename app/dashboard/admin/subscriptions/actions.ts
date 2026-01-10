// app/dashboard/admin/subscriptions/actions.ts
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
        select: { id: true, status: true, userId: true, tier: true },
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
          startsAt: new Date(),
          endsAt: null,
        },
      });

      // ✅ subir tier al que compró (basic o unlimited)
      await tx.userSubscription.upsert({
        where: { userId: purchase.userId },
        create: {
          userId: purchase.userId,
          status: "approved",
          tier: purchase.tier,
          startsAt: new Date(),
          endsAt: null,
        },
        update: {
          status: "approved",
          tier: purchase.tier,
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
        select: { id: true, status: true, userId: true, tier: true },
      });

      if (!purchase) throw new Error("Purchase not found");

      // regla: si ya la aprobaste, no rechaces encima
      if (purchase.status === "approved") {
        throw new Error("Purchase already approved");
      }

      // pending -> rejected (idempotente incluido)
      if (purchase.status !== "rejected") {
        await tx.subscriptionPurchase.update({
          where: { id: purchaseId },
          data: {
            status: "rejected",
            rejectedAt: new Date(),
            approvedAt: null,
          },
        });
      }

      // ✅ Revocar SOLO si el usuario estaba en pending (acceso provisional)
      const sub = await tx.userSubscription.findUnique({
        where: { userId: purchase.userId },
        select: { status: true, tier: true },
      });

      if (sub?.status === "pending") {
        // si estaba pending, sí revocamos (lo regresamos a none)
        await tx.userSubscription.update({
          where: { userId: purchase.userId },
          data: {
            status: "rejected",
            endsAt: new Date(),
            // tier lo puedes dejar como estaba o resetear a basic; no importa si status=rejected
            tier: sub.tier,
          },
        });
      }
      // ✅ Si ya estaba approved (basic), NO lo toques aunque rechaces una compra de upgrade.
    });

    revalidatePath("/dashboard/admin/subscriptions");
    revalidatePath("/dashboard/upgrade");
    revalidatePath("/dashboard/tools/prompt-optimizer");
    return { ok: true, message: "Suscripción rechazada ✅" };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "No se pudo rechazar." };
  }
}
