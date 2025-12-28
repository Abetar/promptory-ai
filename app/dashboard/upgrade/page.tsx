// app/dashboard/upgrade/page.tsx
import Link from "next/link";
import { getSubscriptionSnapshot, hasActiveSubscription } from "@/lib/subscription";
import UpgradeRequestCardClient from "./UpgradeRequestCardClient";

export const runtime = "nodejs";

export default async function UpgradePage() {
  const snap = await getSubscriptionSnapshot();
  const hasPro = await hasActiveSubscription(); // OJO: con tu regla, pending => true

  // No logueado
  if (!snap.isLoggedIn) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 space-y-6">
        <div className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1 text-xs text-neutral-300">
          Suscripción
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">Promptory Pro</h1>
        <p className="text-sm text-neutral-400">
          Inicia sesión para solicitar tu acceso Pro.
        </p>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 flex flex-wrap gap-2">
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

  // ✅ Con confianza: approved/pending se tratan como Pro en UI
  if (hasPro) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 space-y-6">
        <div className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
          Pro activo
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">Promptory Pro</h1>
        <p className="text-sm text-neutral-400">
          Ya tienes acceso a herramientas premium como Prompt Optimizer.
        </p>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 space-y-4">
          <ul className="text-sm text-neutral-200 space-y-2">
            <li>✓ Prompt Optimizer ilimitado</li>
            <li>✓ Acceso anticipado a nuevas herramientas</li>
            <li>✓ Sin límites diarios</li>
          </ul>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/tools"
              className="inline-flex items-center justify-center rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
            >
              Ir a Tools →
            </Link>

            {/* Si quieres, deja un botón para volver a abrir el link de pago */}
            <UpgradeRequestCardClient mode="pro-already" />
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
            >
              Volver
            </Link>
          </div>

          <p className="text-xs text-neutral-500">
            * En este MVP: “pending” se considera Pro (acceso provisional) hasta que un admin lo rechace.
          </p>
        </div>
      </div>
    );
  }

  // ❌ No tiene Pro: mostrar CTA para solicitar + redirect
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 space-y-6">
      <div className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1 text-xs text-neutral-300">
        Suscripción
      </div>

      <h1 className="text-3xl font-semibold tracking-tight">Promptory Pro</h1>
      <p className="text-sm text-neutral-400">
        Acceso ilimitado a herramientas premium como Prompt Optimizer.
      </p>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 space-y-4">
        <ul className="text-sm text-neutral-200 space-y-2">
          <li>✓ Prompt Optimizer ilimitado</li>
          <li>✓ Acceso anticipado a nuevas herramientas</li>
          <li>✓ Sin límites diarios</li>
        </ul>

        <div className="flex flex-wrap gap-2">
          <UpgradeRequestCardClient mode="request" />

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
          >
            Volver
          </Link>
        </div>

        <p className="text-xs text-neutral-500">
          En este MVP: la validación es manual (tipo “packs”). Después lo conectamos a cobro real.
        </p>
      </div>
    </div>
  );
}
