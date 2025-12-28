"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import type { SubscriptionStatus } from "@prisma/client";

type ActionState = { ok: true; message?: string } | { ok: false; message: string };

function isActiveByDates(endsAt: Date | null) {
  if (!endsAt) return true;
  return endsAt.getTime() > Date.now();
}

export async function grantProAction(userId: string): Promise<ActionState> {
  try {
    await requireAdmin();

    const now = new Date();

    // Upsert a UserSubscription a APPROVED (indefinida por ahora)
    await prisma.userSubscription.upsert({
      where: { userId },
      update: {
        status: "approved" as SubscriptionStatus,
        startsAt: now,
        endsAt: null,
        updatedAt: now,
      },
      create: {
        userId,
        status: "approved" as SubscriptionStatus,
        startsAt: now,
        endsAt: null,
      },
    });

    revalidatePath("/dashboard/admin/users");
    revalidatePath("/dashboard"); // por el badge Pro en dashboard
    revalidatePath("/dashboard/upgrade"); // por el estado "ya eres pro"
    revalidatePath("/dashboard/tools/prompt-optimizer");

    return { ok: true, message: "Pro habilitado ✅" };
  } catch (e) {
    return { ok: false, message: "No se pudo habilitar Pro." };
  }
}

export async function revokeProAction(userId: string): Promise<ActionState> {
  try {
    await requireAdmin();

    const now = new Date();

    const sub = await prisma.userSubscription.findUnique({
      where: { userId },
      select: { id: true, status: true, endsAt: true },
    });

    if (!sub) {
      // No hay nada que revocar, idempotente
      revalidatePath("/dashboard/admin/users");
      return { ok: true, message: "Sin suscripción que revocar." };
    }

    // Revocar = cancelar y poner fin inmediato (para que hasActiveSubscription devuelva false)
    await prisma.userSubscription.update({
      where: { userId },
      data: {
        status: "cancelled" as SubscriptionStatus,
        endsAt: now,
        updatedAt: now,
      },
    });

    revalidatePath("/dashboard/admin/users");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/upgrade");
    revalidatePath("/dashboard/tools/prompt-optimizer");

    return { ok: true, message: "Pro revocado ✅" };
  } catch (e) {
    return { ok: false, message: "No se pudo revocar Pro." };
  }
}

/**
 * (Opcional, por si lo quieres después)
 * - Activa Pro pero con fin en X días
 */
export async function grantProDaysAction(userId: string, days: number): Promise<ActionState> {
  try {
    await requireAdmin();
    const now = new Date();
    const endsAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    await prisma.userSubscription.upsert({
      where: { userId },
      update: {
        status: "approved" as SubscriptionStatus,
        startsAt: now,
        endsAt,
        updatedAt: now,
      },
      create: {
        userId,
        status: "approved" as SubscriptionStatus,
        startsAt: now,
        endsAt,
      },
    });

    revalidatePath("/dashboard/admin/users");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/upgrade");
    revalidatePath("/dashboard/tools/prompt-optimizer");

    return { ok: true, message: `Pro habilitado (${days} días) ✅` };
  } catch {
    return { ok: false, message: "No se pudo habilitar Pro por días." };
  }
}
