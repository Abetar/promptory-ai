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

function isActiveByDates(endsAt: Date | null, now = new Date()) {
  if (!endsAt) return true; // indefinida = activa (MVP)
  return endsAt.getTime() > now.getTime();
}

export type SubscriptionTierSnapshot = "none" | "basic" | "unlimited";

type SubRow = {
  status: string | null;
  endsAt: Date | null;
  tier: "basic" | "unlimited" | null;
};

/**
 * ✅ Regla FINAL (single source of truth):
 * - Si existe UserSubscription:
 *   - approved + vigente => tier real
 *   - pending => tier provisional (trust-first) del registro UserSubscription
 *   - rejected/cancelled o approved vencido => none
 * - Si NO existe UserSubscription:
 *   - fallback SUBSCRIBERS_EMAILS => basic (solo dev)
 *   - si no => none
 */
function resolveTierFromSub(sub: SubRow | null, emailLower?: string | null): SubscriptionTierSnapshot {
  const now = new Date();

  if (sub) {
    const status = (sub.status ?? "").toLowerCase();

    // ✅ Pending = acceso provisional al tier guardado
    if (status === "pending") {
      return sub.tier === "unlimited" ? "unlimited" : "basic";
    }

    // ✅ Approved vigente = tier real
    if (status === "approved" && isActiveByDates(sub.endsAt ?? null, now)) {
      return sub.tier === "unlimited" ? "unlimited" : "basic";
    }

    // ✅ Si hay registro pero NO es eligible => NONE (y NO se permite fallback)
    // Esto evita que SUBSCRIBERS_EMAILS "reviva" a alguien revocado.
    return "none";
  }

  // ✅ Sin registro en DB => fallback temporal (solo dev)
  if (emailLower) {
    const allowed = getSubscriberEmailsFallback();
    if (allowed.includes(emailLower)) return "basic";
  }

  return "none";
}

export async function getSubscriptionTier(): Promise<SubscriptionTierSnapshot> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const emailLower = session?.user?.email?.toLowerCase() ?? null;

  if (!userId) return "none";

  const sub = await prisma.userSubscription.findUnique({
    where: { userId },
    select: { status: true, endsAt: true, tier: true },
  });

  return resolveTierFromSub(
    sub
      ? {
          status: sub.status,
          endsAt: sub.endsAt ?? null,
          tier: (sub.tier as any) ?? null,
        }
      : null,
    emailLower
  );
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
 * - NO hace doble query
 * - tier se resuelve a partir de sub + reglas anteriores
 */
export async function getSubscriptionSnapshot() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const emailLower = session?.user?.email?.toLowerCase() ?? null;

  if (!userId) {
    return {
      isLoggedIn: false,
      userId: null as string | null,
      email: emailLower,
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
      tier: true, // ✅ incluir tier aquí
      endsAt: true,
      startsAt: true,
      updatedAt: true,
    },
  });

  const tier = resolveTierFromSub(
    sub
      ? {
          status: sub.status,
          endsAt: sub.endsAt ?? null,
          tier: (sub.tier as any) ?? null,
        }
      : null,
    emailLower
  );

  return {
    isLoggedIn: true,
    userId,
    email: emailLower,
    status: sub?.status ?? null,
    tier,
    endsAt: sub?.endsAt ?? null,
    startsAt: sub?.startsAt ?? null,
    updatedAt: sub?.updatedAt ?? null,
  };
}
