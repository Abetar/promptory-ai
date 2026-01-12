// app/dashboard/admin/subscriptions/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";

export type ActionState =
  | { ok: true; message?: string }
  | { ok: false; message: string };

// ============================================
// ✅ EXISTENTE: Aprobar compra de suscripción
// ============================================
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
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/tools/prompt-optimizer");
    revalidatePath("/dashboard/tools/optimizer-unlimited");

    return { ok: true, message: "Suscripción aprobada ✅" };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "No se pudo aprobar." };
  }
}

// ============================================
// ✅ EXISTENTE: Rechazar compra de suscripción
// ============================================
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
        await tx.userSubscription.update({
          where: { userId: purchase.userId },
          data: {
            status: "rejected",
            endsAt: new Date(),
            tier: sub.tier,
          },
        });
      }
    });

    revalidatePath("/dashboard/admin/subscriptions");
    revalidatePath("/dashboard/upgrade");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/tools/prompt-optimizer");
    revalidatePath("/dashboard/tools/optimizer-unlimited");

    return { ok: true, message: "Suscripción rechazada ✅" };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "No se pudo rechazar." };
  }
}

// =====================================================
// ✅ NUEVO: Aprobar request de cambio (cancel / downgrade)
// =====================================================
//
// 🔥 CAMBIO IMPORTANTE:
// - Si es DOWNGRADE: NO cambiamos tier en DB.
//   Solo marcamos el request como aprobado.
//   (El tier se cambia cuando el usuario activa Basic con el link / y tú lo reflejas vía purchase.)
//
export async function approveSubscriptionChangeRequestAction(
  requestId: string
): Promise<ActionState> {
  try {
    await requireAdmin();

    await prisma.$transaction(async (tx) => {
      const req = await tx.subscriptionChangeRequest.findUnique({
        where: { id: requestId },
        select: {
          id: true,
          status: true,
          type: true,
          userId: true,
        },
      });

      if (!req) throw new Error("Change request not found");

      // idempotente
      if (req.status === "approved") return;

      // no aprobar encima de rechazado
      if (req.status === "rejected") {
        throw new Error("Change request already rejected");
      }

      // ✅ Marcar request como aprobado/resuelto
      await tx.subscriptionChangeRequest.update({
        where: { id: requestId },
        data: {
          status: "approved",
          resolvedAt: new Date(),
          resolvedBy: "admin",
        },
      });

      // ✅ Cancelación: sí reflejamos cancelación interna (DB)
      // (MercadoPago sigue siendo manual, pero al menos la UI se bloquea)
      if (req.type === "cancel") {
        const sub = await tx.userSubscription.findUnique({
          where: { userId: req.userId },
          select: { id: true },
        });

        if (sub) {
          await tx.userSubscription.update({
            where: { userId: req.userId },
            data: {
              status: "cancelled",
              endsAt: new Date(),
            },
          });
        }
      }

      // ✅ Downgrade: NO tocamos UserSubscription tier aquí.
      // El banner del dashboard guiará al usuario a activar Pro Basic con el link.
    });

    revalidatePath("/dashboard/admin/subscriptions");
    revalidatePath("/dashboard/upgrade");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/tools/prompt-optimizer");
    revalidatePath("/dashboard/tools/optimizer-unlimited");

    return { ok: true, message: "Request aprobado ✅" };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "No se pudo aprobar el request." };
  }
}

// =====================================================
// ✅ NUEVO: Rechazar request de cambio (cancel / downgrade)
// =====================================================
export async function rejectSubscriptionChangeRequestAction(
  requestId: string
): Promise<ActionState> {
  try {
    await requireAdmin();

    await prisma.$transaction(async (tx) => {
      const req = await tx.subscriptionChangeRequest.findUnique({
        where: { id: requestId },
        select: { id: true, status: true },
      });

      if (!req) throw new Error("Change request not found");

      // no rechazar encima de aprobado
      if (req.status === "approved") {
        throw new Error("Change request already approved");
      }

      // idempotente reject
      if (req.status !== "rejected") {
        await tx.subscriptionChangeRequest.update({
          where: { id: requestId },
          data: {
            status: "rejected",
            resolvedAt: new Date(),
            resolvedBy: "admin",
          },
        });
      }
    });

    revalidatePath("/dashboard/admin/subscriptions");
    revalidatePath("/dashboard/upgrade");
    revalidatePath("/dashboard");

    return { ok: true, message: "Request rechazado ✅" };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "No se pudo rechazar el request." };
  }
}
