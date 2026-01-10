// app/dashboard/tools/optimizer-unlimited/page.tsx
export const runtime = "nodejs";

import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasUnlimitedSubscription } from "@/lib/subscription";

import OptimizerUnlimitedClient from "./OptimizerUnlimitedClient";

export default async function OptimizerUnlimitedPage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = Boolean(session?.user?.email);

  if (!isLoggedIn) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 space-y-6">
        <div>
          <div className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1 text-xs text-neutral-300">
            Optimizer Unlimited
          </div>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            Inicia sesión para usar esta herramienta
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Esta herramienta es exclusiva de{" "}
            <span className="text-fuchsia-200 font-semibold">Pro Unlimited</span>.
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
            href="/dashboard/tools"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
          >
            Volver a Tools
          </Link>
        </div>
      </div>
    );
  }

  const hasUnlimited = await hasUnlimitedSubscription();

  if (!hasUnlimited) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-200">
              Requiere Pro Unlimited
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight">
              Optimizer Unlimited
            </h1>

            <p className="mt-2 text-sm text-neutral-400">
              Este módulo es exclusivo del tier{" "}
              <span className="text-fuchsia-200 font-semibold">Unlimited</span>.
              Si ya tienes Basic, aquí es donde haces upgrade.
            </p>
          </div>

          <Link
            href="/dashboard/upgrade"
            className="mt-1 inline-flex items-center justify-center rounded-xl bg-fuchsia-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
          >
            Subir a Unlimited
          </Link>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 space-y-4">
          <ul className="text-sm text-neutral-200 space-y-2">
            <li>✓ Acceso al optimizer extra (tier 2)</li>
            <li>✓ Sin pruebas gratis / acceso controlado</li>
            <li>✓ Ideal para power users</li>
          </ul>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/upgrade"
              className="inline-flex items-center justify-center rounded-xl bg-fuchsia-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
            >
              Ver planes
            </Link>

            <Link
              href="/dashboard/tools"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
            >
              Volver a Tools
            </Link>
          </div>

          <p className="text-xs text-neutral-500">
            * En este MVP: si tu suscripción está <b>pending</b> y es <b>unlimited</b>,
            cuenta como acceso provisional.
          </p>
        </div>
      </div>
    );
  }

  // ✅ Unlimited activo
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-200">
            Pro Unlimited activo
          </div>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            Optimizer Unlimited
          </h1>

          <p className="mt-2 text-sm text-neutral-400">
            Versión avanzada para power users.
          </p>
        </div>

        <Link
          href="/dashboard/tools"
          className="mt-1 inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
        >
          Volver a Tools
        </Link>
      </div>

      <OptimizerUnlimitedClient />
    </div>
  );
}
