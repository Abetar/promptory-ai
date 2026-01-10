// app/dashboard/upgrade/page.tsx
import Link from "next/link";
import { getSubscriptionSnapshot } from "@/lib/subscription";
import UpgradeRequestCardClient from "./UpgradeRequestCardClient";

export const runtime = "nodejs";

export default async function UpgradePage() {
  const snap = await getSubscriptionSnapshot();

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

  // Snapshot (trust-first: pending cuenta como acceso provisional)
  const tier = snap.tier; // "none" | "basic" | "unlimited"
  const status = snap.status; // null | "pending" | "approved" | "rejected" | "cancelled"

  const isUnlimited = tier === "unlimited";
  const isBasic = tier === "basic";
  const isProAny = isUnlimited || isBasic;

  // =========================
  // ✅ Unlimited activo (pending/approved)
  // =========================
  if (isUnlimited) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 space-y-6">
        <div className="inline-flex items-center rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-200">
          Pro Unlimited {status === "pending" ? "(provisional)" : "activo"}
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">Promptory Pro</h1>
        <p className="text-sm text-neutral-400">
          Ya tienes acceso al tier más alto.
        </p>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 space-y-4">
          <ul className="text-sm text-neutral-200 space-y-2">
            <li>✓ Prompt Optimizer (Pro)</li>
            <li>✓ Acceso al Optimizer “Unlimited” (oculto)</li>
            <li>✓ Sin límites diarios</li>
          </ul>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/tools"
              className="inline-flex items-center justify-center rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
            >
              Ir a Tools →
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
            >
              Volver
            </Link>
          </div>

          <p className="text-xs text-neutral-500">
            * En este MVP: “pending” cuenta como acceso provisional hasta que un admin lo rechace.
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // ✅ Basic activo (pending/approved) -> mostrar upsell a Unlimited
  // =========================
  if (isBasic) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 space-y-6">
        <div className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
          Pro Basic {status === "pending" ? "(provisional)" : "activo"}
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">Promptory Pro</h1>
        <p className="text-sm text-neutral-400">
          Ya tienes Pro Basic. Si quieres, puedes subir a Unlimited para desbloquear el optimizer extra.
        </p>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 space-y-4">
          <div className="grid gap-3">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-neutral-100">
                  Tu plan actual
                </div>
                <span className="text-xs rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200">
                  Basic
                </span>
              </div>

              <ul className="mt-3 text-sm text-neutral-200 space-y-2">
                <li>✓ Prompt Optimizer (Pro)</li>
                <li>✓ Sin límites diarios</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-neutral-100">
                  Upgrade a Unlimited
                </div>
                <span className="text-xs rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-1 text-fuchsia-200">
                  Unlimited
                </span>
              </div>

              <p className="mt-2 text-sm text-neutral-400">
                Desbloquea el optimizer extra (sin pruebas gratis).
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <UpgradeRequestCardClient mode="request" tier="unlimited" />
                <Link
                  href="/dashboard/tools"
                  className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
                >
                  Ir a Tools →
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
            >
              Volver
            </Link>
          </div>

          <p className="text-xs text-neutral-500">
            * En este MVP: “pending” cuenta como acceso provisional hasta que un admin lo rechace.
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // ❌ No tiene Pro (none) -> mostrar ambos tiers
  // =========================
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 space-y-6">
      <div className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1 text-xs text-neutral-300">
        Suscripción
      </div>

      <h1 className="text-3xl font-semibold tracking-tight">Promptory Pro</h1>
      <p className="text-sm text-neutral-400">
        Elige tu plan. La validación es manual (trust-first).
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {/* BASIC */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold text-neutral-100">Pro Basic</div>
            <span className="text-xs rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200">
              Basic
            </span>
          </div>

          <ul className="text-sm text-neutral-200 space-y-2">
            <li>✓ Prompt Optimizer (Pro)</li>
            <li>✓ Sin límites diarios</li>
          </ul>

          <div className="pt-2">
            <UpgradeRequestCardClient mode="request" tier="basic" />
          </div>
        </div>

        {/* UNLIMITED */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold text-neutral-100">
              Pro Unlimited
            </div>
            <span className="text-xs rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-1 text-fuchsia-200">
              Unlimited
            </span>
          </div>

          <ul className="text-sm text-neutral-200 space-y-2">
            <li>✓ Todo lo de Basic</li>
            <li>✓ Optimizer extra (oculto)</li>
            <li>✓ Sin pruebas gratis</li>
          </ul>

          <div className="pt-2">
            <UpgradeRequestCardClient mode="request" tier="unlimited" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
        >
          Volver
        </Link>
      </div>

      <p className="text-xs text-neutral-500">
        En este MVP: al solicitar un plan, se habilita acceso provisional (pending) y un admin lo aprueba/rechaza.
      </p>
    </div>
  );
}
