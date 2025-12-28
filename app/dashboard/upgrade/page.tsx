// app/dashboard/upgrade/page.tsx
export const runtime = "nodejs";

import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UpgradeRequestCardClient from "./UpgradeRequestCardClient";

export default async function UpgradePage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = Boolean(session?.user?.email);
  const userId = (session?.user as any)?.id as string | undefined;

  // No logueado
  if (!isLoggedIn || !userId) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1 text-xs text-neutral-300">
            Suscripción
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Promptory Pro</h1>
          <p className="text-sm text-neutral-400">
            Acceso ilimitado a herramientas premium como Prompt Optimizer.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 space-y-3">
          <p className="text-sm text-neutral-300">
            Inicia sesión para solicitar tu suscripción Pro.
          </p>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/api/auth/signin"
              className="inline-flex items-center justify-center rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
            >
              Iniciar sesión
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
            >
              Volver
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Estado actual (DB)
  const sub = await prisma.userSubscription.findUnique({
    where: { userId },
    select: { status: true, endsAt: true, updatedAt: true },
  });

  const status = sub?.status ?? null;

  const isApproved =
    status === "approved" && (sub?.endsAt == null || sub.endsAt.getTime() > Date.now());

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1 text-xs text-neutral-300">
          Suscripción
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">Promptory Pro</h1>
        <p className="text-sm text-neutral-400">
          Acceso ilimitado a herramientas premium como Prompt Optimizer.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 space-y-4">
        <ul className="space-y-2 text-sm text-neutral-200">
          <li>✓ Prompt Optimizer ilimitado</li>
          <li>✓ Acceso anticipado a nuevas herramientas</li>
          <li>✓ Sin límites diarios</li>
        </ul>

        {/* ✅ Si ya es Pro */}
        {isApproved ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3">
            <div className="font-semibold text-emerald-200">Ya eres Pro ✅</div>
            <p className="text-sm text-emerald-200/80">
              Tu suscripción está activa. Puedes ir directo a las herramientas.
            </p>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/tools"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
              >
                Ir a Tools
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
              >
                Volver
              </Link>
            </div>
          </div>
        ) : (
          // ✅ No es Pro (pending / rejected / null) -> UI interactiva en Client Component
          <UpgradeRequestCardClient initialStatus={status} />
        )}
      </div>
    </div>
  );
}
