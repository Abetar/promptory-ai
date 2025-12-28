import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * MVP con cero deuda:
 * - Fuente real: UserSubscription (approved/pending + vigente)
 * - Fallback temporal: SUBSCRIBERS_EMAILS (solo para pruebas)
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

/** ✅ Regla de acceso:
 * - approved vigente => true
 * - pending => true (acceso provisional)
 * - rejected/cancelled => false
 */
export async function hasActiveSubscription(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const email = session?.user?.email?.toLowerCase();

  if (!userId) return false;

  const sub = await prisma.userSubscription.findUnique({
    where: { userId },
    select: { status: true, endsAt: true },
  });

  if (sub?.status === "approved" && isActiveByDates(sub.endsAt ?? null)) {
    return true;
  }

  // ✅ pending = acceso provisional (trust)
  if (sub?.status === "pending") {
    return true;
  }

  // ✅ Fallback temporal (solo dev)
  if (email) {
    const allowed = getSubscriberEmailsFallback();
    if (allowed.includes(email)) return true;
  }

  return false;
}

/**
 * Útil para UI (upgrade page) sin duplicar lógica.
 */
export async function getSubscriptionSnapshot() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const email = session?.user?.email?.toLowerCase() ?? null;

  if (!userId) {
    return { isLoggedIn: false, userId: null as string | null, email, status: null as any };
  }

  const sub = await prisma.userSubscription.findUnique({
    where: { userId },
    select: { status: true, endsAt: true, startsAt: true, updatedAt: true },
  });

  return {
    isLoggedIn: true,
    userId,
    email,
    status: sub?.status ?? null,
    endsAt: sub?.endsAt ?? null,
    startsAt: sub?.startsAt ?? null,
    updatedAt: sub?.updatedAt ?? null,
  };
}
