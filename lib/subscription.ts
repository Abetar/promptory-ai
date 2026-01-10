// lib/subscription.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * MVP con cero deuda:
 * - Fuente real: UserSubscription (status + tier + vigente)
 * - Fallback temporal: SUBSCRIBERS_EMAILS (solo pruebas)
 */

function getSubscriberEmailsFallback() {
  return (process.env.SUBSCRIBERS_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function isActiveByDates(endsAt: Date | null) {
  if (!endsAt) return true; // indefinida = activa (MVP)
  return endsAt.getTime() > Date.now();
}

export type SubscriptionTierSnapshot = "none" | "basic" | "unlimited";

/**
 * ✅ Regla:
 * - approved vigente => tier real
 * - pending => tier provisional (trust-first) del registro UserSubscription
 * - rejected/cancelled => none
 */
export async function getSubscriptionTier(): Promise<SubscriptionTierSnapshot> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const email = session?.user?.email?.toLowerCase();

  if (!userId) return "none";

  const sub = await prisma.userSubscription.findUnique({
    where: { userId },
    select: { status: true, endsAt: true, tier: true },
  });

  // ✅ approved vigente
  if (sub?.status === "approved" && isActiveByDates(sub.endsAt ?? null)) {
    return sub.tier === "unlimited" ? "unlimited" : "basic";
  }

  // ✅ pending = acceso provisional (trust) al tier solicitado
  if (sub?.status === "pending") {
    return sub.tier === "unlimited" ? "unlimited" : "basic";
  }

  // ✅ Fallback temporal (solo dev): si está en allowlist => basic
  if (email) {
    const allowed = getSubscriberEmailsFallback();
    if (allowed.includes(email)) return "basic";
  }

  return "none";
}

/**
 * ✅ “Pro” general (tier 1 o tier 2)
 */
export async function hasActiveSubscription(): Promise<boolean> {
  const tier = await getSubscriptionTier();
  return tier !== "none";
}

/**
 * ✅ Tier 2
 */
export async function hasUnlimitedSubscription(): Promise<boolean> {
  const tier = await getSubscriptionTier();
  return tier === "unlimited";
}

/**
 * Útil para UI (upgrade page) sin duplicar lógica.
 * - tier se deriva de getSubscriptionTier() (single source of truth)
 */
export async function getSubscriptionSnapshot() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const email = session?.user?.email?.toLowerCase() ?? null;

  if (!userId) {
    return {
      isLoggedIn: false,
      userId: null as string | null,
      email,
      status: null as any,
      tier: "none" as SubscriptionTierSnapshot,
      endsAt: null as Date | null,
      startsAt: null as Date | null,
      updatedAt: null as Date | null,
    };
  }

  const sub = await prisma.userSubscription.findUnique({
    where: { userId },
    select: {
      status: true,
      endsAt: true,
      startsAt: true,
      updatedAt: true,
      // tier no es necesario aquí para el snapshot (lo resolvemos con getSubscriptionTier)
    },
  });

  const tier = await getSubscriptionTier();

  return {
    isLoggedIn: true,
    userId,
    email,
    status: sub?.status ?? null,
    tier,
    endsAt: sub?.endsAt ?? null,
    startsAt: sub?.startsAt ?? null,
    updatedAt: sub?.updatedAt ?? null,
  };
}
