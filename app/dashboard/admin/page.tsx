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

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-950/40 px-2 py-0.5 text-[11px] font-semibold text-neutral-200">
      {children}
    </span>
  );
}

export default async function AdminHomePage() {
  await requireAdmin();

  // ✅ Pendientes de suscripción
  const pendingSubs = await prisma.subscriptionPurchase.count({
    where: { status: "pending" },
  });

  // ✅ Pendientes de packs
  const pendingPackPurchases = await prisma.packPurchase.count({
    where: { status: "pending" },
  });

  // ✅ Pendientes de prompt requests
  const pendingRequests = await prisma.promptRequest.count({
    where: { resolvedAt: null },
  });

  // =========================
  // ✅ Uso reciente (AuditEvent)
  // =========================
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );
  const startOfTomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0
  );

  // Total eventos hoy
  const eventsToday = await prisma.auditEvent.count({
    where: {
      createdAt: { gte: startOfToday, lt: startOfTomorrow },
    },
  });

  // ✅ NUEVO: runs del Prompt Optimizer hoy
  const optimizerRunsToday = await prisma.auditEvent.count({
    where: {
      event: "optimizer.run",
      createdAt: { gte: startOfToday, lt: startOfTomorrow },
    },
  });

  // Usuarios únicos con login hoy (por emailSnapshot)
  const loginUsersToday = await prisma.auditEvent.findMany({
    where: {
      event: "auth.login",
      createdAt: { gte: startOfToday, lt: startOfTomorrow },
      emailSnapshot: { not: null },
    },
    select: { emailSnapshot: true },
    distinct: ["emailSnapshot"],
  });

  const activeUsersToday = loginUsersToday.length;

  // Top prompts copiados hoy (por entityId)
  const topCopies = await prisma.auditEvent.groupBy({
    by: ["entityId"],
    where: {
      event: "prompt.copy",
      createdAt: { gte: startOfToday, lt: startOfTomorrow },
      entityId: { not: null },
    },
    _count: { entityId: true },
    orderBy: { _count: { entityId: "desc" } },
    take: 5,
  });

  const promptIds = topCopies
    .map((x) => x.entityId)
    .filter(Boolean) as string[];

  const prompts = promptIds.length
    ? await prisma.prompt.findMany({
        where: { id: { in: promptIds } },
        select: { id: true, title: true },
      })
    : [];

  const promptTitleById = new Map(prompts.map((p) => [p.id, p.title]));

  // Últimos logins
  const recentLogins = await prisma.auditEvent.findMany({
    where: { event: "auth.login" },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      emailSnapshot: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Gestiona prompts, publicación, precios y aprobaciones.
        </p>
      </div>

      {/* Cards principales */}
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

        {/* Requests con badge */}
        <Link
          href="/dashboard/admin/requests"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
        >
          <div className="text-sm font-semibold text-neutral-100">
            Requests
            {pendingRequests > 0 ? (
              <Badge>{pendingRequests} nuevo(s)</Badge>
            ) : null}
          </div>
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

        <Link
          href="/dashboard/admin/purchases"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
        >
          <div className="text-sm font-semibold text-neutral-100">
            Compras
            {pendingPackPurchases > 0 ? (
              <Badge>{pendingPackPurchases} pendiente(s)</Badge>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-neutral-400">
            Validar pagos y desbloquear packs.
          </p>
          <div className="mt-4 inline-flex rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950">
            Gestionar →
          </div>
        </Link>

        <Link
          href="/dashboard/admin/subscriptions"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
        >
          <div className="text-sm font-semibold text-neutral-100">
            Suscripciones
            {pendingSubs > 0 ? (
              <Badge>{pendingSubs} pendiente(s)</Badge>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-neutral-400">
            Aprobar / rechazar solicitudes Pro (validación manual).
          </p>
          <div className="mt-4 inline-flex rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950">
            Gestionar →
          </div>
        </Link>
      </div>

      {/* ✅ Uso reciente */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Uso reciente</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Señales rápidas para validar actividad real (hoy).
            </p>
          </div>

          <Link
            href="/dashboard/admin/events"
            className="text-sm text-neutral-300 hover:text-neutral-100 transition"
          >
            Ver logs →
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {/* Usuarios activos */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold text-neutral-100">
                Usuarios activos hoy
              </div>
              <Pill>auth.login</Pill>
            </div>

            <div className="mt-3 text-3xl font-semibold text-neutral-100">
              {activeUsersToday}
            </div>

            <p className="mt-2 text-sm text-neutral-400">
              Usuarios únicos con login hoy.
            </p>
          </div>

          {/* Eventos hoy */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold text-neutral-100">
                Eventos hoy
              </div>
              <Pill>AuditEvent</Pill>
            </div>

            <div className="mt-3 text-3xl font-semibold text-neutral-100">
              {eventsToday}
            </div>

            <p className="mt-2 text-sm text-neutral-400">
              Total de eventos registrados hoy.
            </p>
          </div>

          {/* Optimizer runs hoy */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold text-neutral-100">
                Runs Optimizer (hoy)
              </div>
              <Pill>optimizer.run</Pill>
            </div>

            <div className="mt-3 text-3xl font-semibold text-neutral-100">
              {optimizerRunsToday}
            </div>

            <p className="mt-2 text-sm text-neutral-400">
              Veces que se ejecutó el Prompt Optimizer hoy.
            </p>
          </div>

          {/* Top prompts copiados */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold text-neutral-100">
                Top prompts copiados (hoy)
              </div>
              <Pill>prompt.copy</Pill>
            </div>

            <div className="mt-3 space-y-2">
              {topCopies.length === 0 ? (
                <div className="text-sm text-neutral-400">
                  Aún no hay copias hoy.
                </div>
              ) : (
                topCopies.map((row) => {
                  const id = row.entityId ?? "";
                  const title = promptTitleById.get(id) ?? `Prompt (${id})`;
                  const count = row._count.entityId;

                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-neutral-100">
                          {title}
                        </div>
                        <div className="truncate text-xs text-neutral-500">
                          {id}
                        </div>
                      </div>

                      <div className="shrink-0 text-sm font-semibold text-neutral-100">
                        {count}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Últimos logins */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-neutral-100">
                Últimos logins
              </div>
              <p className="mt-1 text-sm text-neutral-400">
                Los accesos más recientes a la app.
              </p>
            </div>

            <Link
              href="/dashboard/admin/events"
              className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
            >
              Ver detalle →
            </Link>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {recentLogins.length === 0 ? (
              <div className="text-sm text-neutral-400">
                Aún no hay logins registrados.
              </div>
            ) : (
              recentLogins.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-neutral-100">
                      {e.emailSnapshot ?? "—"}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {new Date(e.createdAt).toLocaleString("es-MX")}
                    </div>
                  </div>

                  <Pill>login</Pill>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
