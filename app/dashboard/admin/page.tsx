import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-2 inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-200">
      {children}
    </span>
  );
}

export default async function AdminHomePage() {
  await requireAdmin();

  // ✅ Pendientes de suscripción (para badge rápido)
  const pendingSubs = await prisma.subscriptionPurchase.count({
    where: { status: "pending" },
  });

  // ✅ Pendientes de packs (si quieres también mostrar badge aquí)
  const pendingPackPurchases = await prisma.packPurchase.count({
    where: { status: "pending" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Gestiona prompts, publicación, precios y aprobaciones.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/dashboard/admin/prompts"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
        >
          <div className="text-sm font-semibold text-neutral-100">Prompts</div>
          <p className="mt-2 text-sm text-neutral-400">
            Crear, editar, publicar y asignar AIs.
          </p>
          <div className="mt-4 inline-flex rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950">
            Entrar →
          </div>
        </Link>

        <Link
          href="/dashboard/admin/ai-tools"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
        >
          <div className="text-sm font-semibold text-neutral-100">AIs</div>
          <p className="mt-2 text-sm text-neutral-400">
            Crear, editar, activar/desactivar y mantener catálogo.
          </p>
          <div className="mt-4 inline-flex rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950">
            Entrar →
          </div>
        </Link>

        {/* ✅ Packs */}
        <Link
          href="/dashboard/admin/packs"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
        >
          <div className="text-sm font-semibold text-neutral-100">Packs</div>
          <p className="mt-2 text-sm text-neutral-400">
            Crear, editar, publicar y asignar prompts a packs.
          </p>
          <div className="mt-4 inline-flex rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950">
            Entrar →
          </div>
        </Link>

        <Link
          href="/dashboard/admin/requests"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
        >
          <div className="text-sm font-semibold text-neutral-100">Requests</div>
          <p className="mt-2 text-sm text-neutral-400">
            Solicitudes de nuevos prompts enviadas por usuarios.
          </p>
          <div className="mt-4 inline-flex rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950">
            Entrar →
          </div>
        </Link>

        <Link
          href="/dashboard/admin/access"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
        >
          <div className="text-sm font-semibold text-neutral-100">Accesos</div>
          <p className="mt-2 text-sm text-neutral-400">
            Otorgar acceso a prompts premium por usuario.
          </p>
          <div className="mt-4 inline-flex rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950">
            Entrar →
          </div>
        </Link>

        <Link
          href="/dashboard/admin/users"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
        >
          <div className="text-sm font-semibold text-neutral-100">Usuarios</div>
          <p className="mt-2 text-sm text-neutral-400">
            Ver quién ya tiene cuenta en Promptory AI.
          </p>
          <div className="mt-4 inline-flex rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950">
            Entrar →
          </div>
        </Link>

        {/* ✅ Compras packs */}
        <Link
          href="/dashboard/admin/purchases"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
        >
          <div className="text-sm font-semibold text-neutral-100">
            Compras
            {pendingPackPurchases > 0 ? <Badge>{pendingPackPurchases} pendiente(s)</Badge> : null}
          </div>
          <p className="mt-2 text-sm text-neutral-400">
            Validar pagos y desbloquear packs.
          </p>
          <div className="mt-4 inline-flex rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950">
            Gestionar →
          </div>
        </Link>

        {/* ✅ NUEVO: Suscripciones Pro */}
        <Link
          href="/dashboard/admin/subscriptions"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
        >
          <div className="text-sm font-semibold text-neutral-100">
            Suscripciones
            {pendingSubs > 0 ? <Badge>{pendingSubs} pendiente(s)</Badge> : null}
          </div>
          <p className="mt-2 text-sm text-neutral-400">
            Aprobar / rechazar solicitudes Pro (validación manual).
          </p>
          <div className="mt-4 inline-flex rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950">
            Gestionar →
          </div>
        </Link>
      </div>
    </div>
  );
}
