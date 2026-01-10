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
async function grantTier(userId: string, tier: SubscriptionTier, endsAt?: Date | null) {
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

    // Auditoría tipo "packs"
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

export async function grantProBasicAction(userId: string): Promise<ActionState> {
  try {
    await requireAdmin();
    await grantTier(userId, "basic", null);

    revalidatePath("/dashboard/admin/users");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/upgrade");
    revalidatePath("/dashboard/tools/prompt-optimizer");
    revalidatePath("/dashboard/tools/optimizer-unlimited");

    return { ok: true, message: "Pro Basic habilitado ✅" };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "No se pudo habilitar Pro Basic." };
  }
}

export async function grantProUnlimitedAction(userId: string): Promise<ActionState> {
  try {
    await requireAdmin();
    await grantTier(userId, "unlimited", null);

    revalidatePath("/dashboard/admin/users");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/upgrade");
    revalidatePath("/dashboard/tools/prompt-optimizer");
    revalidatePath("/dashboard/tools/optimizer-unlimited");

    return { ok: true, message: "Pro Unlimited habilitado ✅" };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "No se pudo habilitar Pro Unlimited." };
  }
}

export async function revokeProAction(userId: string): Promise<ActionState> {
  try {
    await requireAdmin();

    const now = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.userSubscription.upsert({
        where: { userId },
        create: {
          userId,
          status: "rejected", // ✅ para que getSubscriptionTier() devuelva "none"
          tier: "basic",
          startsAt: now,
          endsAt: now,
          note: "manual/admin revoke",
        },
        update: {
          status: "rejected",
          endsAt: now,
          note: "manual/admin revoke",
        },
      });

      await tx.subscriptionPurchase.create({
        data: {
          userId,
          amountMx: 0,
          status: "rejected",
          tier: "basic",
          note: "manual/admin revoke",
          rejectedAt: now,
        },
      });
    });

    revalidatePath("/dashboard/admin/users");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/upgrade");
    revalidatePath("/dashboard/tools/prompt-optimizer");
    revalidatePath("/dashboard/tools/optimizer-unlimited");

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

    revalidatePath("/dashboard/admin/users");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/upgrade");
    revalidatePath("/dashboard/tools/prompt-optimizer");
    revalidatePath("/dashboard/tools/optimizer-unlimited");

    return { ok: true, message: `Pro ${tier} habilitado (${days} días) ✅` };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "No se pudo habilitar Pro por días." };
  }
}
