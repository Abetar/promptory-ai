// app/dashboard/admin/users/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import type { SubscriptionTier } from "@prisma/client";

export type ActionState =
  | { ok: true; message?: string }
  | { ok: false; message: string };

/**
 * ✅ Otorga (o actualiza) suscripción approved con tier.
 * - También crea un SubscriptionPurchase "audit" con amountMx=0 para dejar rastro.
 */
async function grantTier(
  userId: string,
  tier: SubscriptionTier,
  endsAt?: Date | null
) {
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.userSubscription.upsert({
      where: { userId },
      create: {
        userId,
        status: "approved",
        tier,
        startsAt: now,
        endsAt: endsAt ?? null,
        note: "manual/admin",
      },
      update: {
        status: "approved",
        tier,
        startsAt: now,
        endsAt: endsAt ?? null,
        note: "manual/admin",
      },
    });

    await tx.subscriptionPurchase.create({
      data: {
        userId,
        amountMx: 0,
        status: "approved",
        tier,
        note: endsAt ? "manual/admin grant (limited)" : "manual/admin grant",
        approvedAt: now,
        startsAt: now,
        endsAt: endsAt ?? null,
      },
    });
  });
}

function revalidateAll() {
  revalidatePath("/dashboard/admin/users");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/upgrade");
  revalidatePath("/dashboard/tools/prompt-optimizer");
  revalidatePath("/dashboard/tools/optimizer-unlimited");
}

export async function grantProBasicAction(userId: string): Promise<ActionState> {
  try {
    await requireAdmin();
    await grantTier(userId, "basic", null);
    revalidateAll();
    return { ok: true, message: "Pro Basic habilitado ✅" };
  } catch (e: any) {
    return {
      ok: false,
      message: e?.message ?? "No se pudo habilitar Pro Basic.",
    };
  }
}

export async function grantProUnlimitedAction(
  userId: string
): Promise<ActionState> {
  try {
    await requireAdmin();
    await grantTier(userId, "unlimited", null);
    revalidateAll();
    return { ok: true, message: "Pro Unlimited habilitado ✅" };
  } catch (e: any) {
    return {
      ok: false,
      message: e?.message ?? "No se pudo habilitar Pro Unlimited.",
    };
  }
}

/**
 * ✅ Revocar:
 * - Si el usuario es unlimited -> baja a basic (approved)  (revocar “tier 2”)
 * - Si el usuario es basic -> queda en none (rejected + endsAt=now) (revocar todo Pro)
 *
 * Nota: aquí NO usamos "upsert create rejected tier basic" a ciegas,
 * porque eso es lo que te estaba dejando al usuario “pegado” en basic.
 */
export async function revokeProAction(userId: string): Promise<ActionState> {
  try {
    await requireAdmin();
    const now = new Date();

    const sub = await prisma.userSubscription.findUnique({
      where: { userId },
      select: { tier: true, status: true },
    });

    // Si no hay sub, ya está en none
    if (!sub) {
      revalidateAll();
      return { ok: true, message: "No tenía Pro. Nada que revocar." };
    }

    // 1) unlimited -> basic (approved)
    if (sub.tier === "unlimited") {
      await prisma.$transaction(async (tx) => {
        await tx.userSubscription.update({
          where: { userId },
          data: {
            status: "approved",
            tier: "basic",
            startsAt: now,
            endsAt: null,
            note: "manual/admin revoke: unlimited -> basic",
          },
        });

        await tx.subscriptionPurchase.create({
          data: {
            userId,
            amountMx: 0,
            status: "approved",
            tier: "basic",
            note: "manual/admin revoke: unlimited -> basic",
            approvedAt: now,
            startsAt: now,
            endsAt: null,
          },
        });
      });

      revalidateAll();
      return { ok: true, message: "Unlimited revocado → ahora es Pro Basic ✅" };
    }

    // 2) basic -> none (rejected)
    if (sub.tier === "basic") {
      await prisma.$transaction(async (tx) => {
        await tx.userSubscription.update({
          where: { userId },
          data: {
            status: "rejected", // para que getSubscriptionTier() devuelva "none"
            tier: "basic",      // mantenemos tier por compatibilidad, pero status manda
            startsAt: now,
            endsAt: now,
            note: "manual/admin revoke: basic -> none",
          },
        });

        await tx.subscriptionPurchase.create({
          data: {
            userId,
            amountMx: 0,
            status: "rejected",
            tier: "basic",
            note: "manual/admin revoke: basic -> none",
            rejectedAt: now,
          },
        });

        // (Opcional recomendado) Cancela purchases pending para que no quede “pendiente” latente
        await tx.subscriptionPurchase.updateMany({
          where: { userId, status: "pending" },
          data: { status: "cancelled", note: "auto-cancel on admin revoke" },
        });
      });

      revalidateAll();
      return { ok: true, message: "Pro Basic revocado → ahora es Free ✅" };
    }

    // Fallback por si un día agregas tiers nuevos
    await prisma.userSubscription.update({
      where: { userId },
      data: {
        status: "rejected",
        endsAt: now,
        note: "manual/admin revoke (fallback)",
      },
    });

    revalidateAll();
    return { ok: true, message: "Pro revocado ✅" };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "No se pudo revocar Pro." };
  }
}

/**
 * (Opcional) Activa Pro por X días.
 * - tier por default: basic
 */
export async function grantProDaysAction(
  userId: string,
  days: number,
  tier: SubscriptionTier = "basic"
): Promise<ActionState> {
  try {
    await requireAdmin();

    const now = new Date();
    const endsAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    await grantTier(userId, tier, endsAt);
    revalidateAll();

    return { ok: true, message: `Pro ${tier} habilitado (${days} días) ✅` };
  } catch (e: any) {
    return {
      ok: false,
      message: e?.message ?? "No se pudo habilitar Pro por días.",
    };
  }
}
