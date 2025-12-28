export const runtime = "nodejs";

import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/subscription";
import PromptOptimizerClient from "./PromptOptimizerClient";

export default async function PromptOptimizerPage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = Boolean(session?.user?.email);

  // ✅ Solo para UI (badge / copy). El backend decide límites y engine.
  const hasSub = isLoggedIn ? await hasActiveSubscription() : false;

  // ❌ Solo bloqueamos por login (no por suscripción)
  if (!isLoggedIn) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 space-y-6">
        <div>
          <div className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1 text-xs text-neutral-300">
            Prompt Optimizer
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            Inicia sesión para usar la herramienta
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Tendrás acceso Free con límites, o Pro ilimitado.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 space-y-3">
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
    );
  }

  // ✅ Usuario logueado: Free o Pro (sin bloquear)
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div
            className={[
              "inline-flex items-center rounded-full border px-3 py-1 text-xs",
              hasSub
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                : "border-neutral-800 bg-neutral-900/40 text-neutral-300",
            ].join(" ")}
          >
            {hasSub ? "Pro activo" : "Free (con límites)"}
          </div>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            Prompt Optimizer
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Pega tu prompt → recibe una versión mejor.
          </p>
        </div>

        {!hasSub ? (
          <Link
            href="/dashboard/upgrade"
            className="mt-1 inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
          >
            Upgrade a Pro
          </Link>
        ) : null}
      </div>

      <PromptOptimizerClient />
    </div>
  );
}
