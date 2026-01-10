import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import {
  hasActiveSubscription,
  hasUnlimitedSubscription,
} from "@/lib/subscription";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function isAdminEmail(email?: string | null) {
  if (!email) return false;
  const allow = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return allow.includes(email.trim().toLowerCase());
}

function ProBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-200">
      PRO
    </span>
  );
}

function ProUnlimitedBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-0.5 text-xs font-semibold text-fuchsia-200">
      PRO UNLIMITED
    </span>
  );
}

function LockedPill() {
  return (
    <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-200">
      Pro
    </span>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-2 inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-200">
      {children}
    </span>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const name =
    session?.user?.name?.split(" ")[0] ||
    session?.user?.email?.split("@")[0] ||
    "usuario";

  const isAdmin = isAdminEmail(session?.user?.email);

  // ✅ Pro real (DB + fallback env según tu subscription.ts)
  const isPro = await hasActiveSubscription();

  // ✅ Unlimited (Pro Unlimited) - solo para render UI
  const isUnlimited = await hasUnlimitedSubscription();

  // ✅ NUEVO: requests del usuario (pendientes = en revisión)
  const userEmail = session?.user?.email ?? null;
  const pendingMyRequests = userEmail
    ? await prisma.promptRequest.count({
        where: { userEmail, resolvedAt: null },
      })
    : 0;

  return (
    <div className="space-y-8">
      {/* Header simple */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

          <p className="text-sm text-neutral-400 flex flex-wrap items-center gap-2">
            Bienvenido, <span className="text-neutral-200">{name}</span>
            {isUnlimited ? (
              <ProUnlimitedBadge />
            ) : isPro ? (
              <ProBadge />
            ) : null}
          </p>

          {!isPro ? (
            <div className="text-xs text-neutral-500">
              Tip: con <span className="text-neutral-300">Pro</span> tienes
              acceso ilimitado a herramientas premium.
            </div>
          ) : null}

          {/* ✅ Micro-link a Mis requests */}
          <div className="text-xs">
            <Link
              href="/dashboard/requests"
              className="text-neutral-400 hover:text-neutral-200 transition"
            >
              Ver mis requests →
            </Link>
          </div>
        </div>

        {/* ✅ Botón Admin solo visible para admins */}
        <div className="flex items-center gap-2">
          {!isPro ? (
            <Link
              href="/dashboard/upgrade"
              className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
            >
              Hazte Pro →
            </Link>
          ) : (
            <Link
              href="/dashboard/upgrade"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
            >
              Gestionar {isUnlimited ? "Unlimited" : "Pro"} →
            </Link>
          )}

          {isAdmin ? (
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
            >
              Admin →
            </Link>
          ) : null}
        </div>
      </div>

      {/* ✅ CTA Pro (solo si NO es pro) */}
      {!isPro ? (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-amber-200">
                Desbloquea Promptory Pro
              </div>
              <p className="mt-1 text-sm text-amber-200/80">
                Prompt Optimizer ilimitado, acceso anticipado a nuevas
                herramientas y cero límites diarios.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/upgrade"
                className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
              >
                Suscribirme →
              </Link>

              <Link
                href="/dashboard/tools/prompt-optimizer"
                className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
              >
                Ver herramienta →
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* Acciones principales */}
      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/dashboard/prompts"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
        >
          <div className="text-sm font-semibold text-neutral-100">
            Explorar prompts
          </div>
          <p className="mt-2 text-sm text-neutral-400">
            Encuentra prompts por tipo, AI y free/premium.
          </p>
          <div className="mt-4 inline-flex rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950">
            Ir a Prompts →
          </div>
        </Link>

        <Link
          href="/dashboard/mis-prompts"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
        >
          <div className="text-sm font-semibold text-neutral-100">
            Mis prompts
          </div>
          <p className="mt-2 text-sm text-neutral-400">
            Favoritos y prompts guardados para acceso rápido.
          </p>
          <div className="mt-4 inline-flex rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition">
            Ver guardados →
          </div>
        </Link>

        <Link
          href="/dashboard/packs"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
        >
          <div className="text-sm font-semibold text-neutral-100">
            Packs de prompts
          </div>
          <p className="mt-2 text-sm text-neutral-400">
            Colecciones curadas de prompts listas para usar.
          </p>
          <div className="mt-4 inline-flex rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950">
            Ver Packs →
          </div>
        </Link>

        <Link
          href="/dashboard/compras"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
        >
          <div className="text-sm font-semibold text-neutral-100">
            Mis compras
          </div>
          <p className="mt-2 text-sm text-neutral-400">
            Revisa el estado de tus packs premium.
          </p>
          <div className="mt-4 inline-flex rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition">
            Ver historial →
          </div>
        </Link>

        {/* ✅ Mis requests + badge */}
        <Link
          href="/dashboard/requests"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
        >
          <div className="text-sm font-semibold text-neutral-100">
            Mis requests
            {pendingMyRequests > 0 ? (
              <Badge>{pendingMyRequests} en revisión</Badge>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-neutral-400">
            Da seguimiento a tus solicitudes de nuevos prompts.
          </p>
          <div className="mt-4 inline-flex rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition">
            Ver estado →
          </div>
        </Link>
      </section>

      {/* ✅ Tools */}
      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Tools</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Herramientas para acelerar tu creación de prompts.
            </p>
          </div>

          <Link
            href="/dashboard/tools"
            className="text-sm text-neutral-300 hover:text-neutral-100 transition"
          >
            Ver todas →
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Prompt Optimizer */}
          <div className="relative rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                  Prompt Optimizer
                  {!isPro ? <LockedPill /> : null}
                </div>
                <p className="mt-2 text-sm text-neutral-400">
                  Pega tu prompt → recibe una versión más específica y accionable.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/dashboard/tools/prompt-optimizer"
                className={[
                  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition",
                  isPro
                    ? "bg-neutral-100 text-neutral-950 hover:opacity-90"
                    : "border border-neutral-800 bg-neutral-950 text-neutral-200 hover:bg-neutral-900",
                ].join(" ")}
              >
                {isPro ? "Abrir →" : "Ver →"}
              </Link>

              {!isPro ? (
                <Link
                  href="/dashboard/upgrade"
                  className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
                >
                  Hacerme Pro →
                </Link>
              ) : null}
            </div>

            {/* Overlay suave si no es pro */}
            {!isPro ? (
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-neutral-950/0 to-neutral-950/30" />
            ) : null}
          </div>

          {/* ✅ Optimizer Ultimate / Unlimited (NSFW) */}
          <div className="relative rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                  Optimizer Ultimate
                  <span className="inline-flex items-center rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-0.5 text-xs font-semibold text-fuchsia-200">
                    NSFW
                  </span>
                </div>
                <p className="mt-2 text-sm text-neutral-400">
                  Optimización avanzada (Ultimate). Output: solo prompts
                  optimizados.
                </p>
              </div>

              {!isUnlimited ? (
                <Link
                  href="/dashboard/upgrade"
                  className="inline-flex items-center justify-center rounded-xl bg-fuchsia-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
                >
                  Subir a Unlimited
                </Link>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/dashboard/tools/optimizer-unlimited"
                className={[
                  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition",
                  isUnlimited
                    ? "bg-neutral-100 text-neutral-950 hover:opacity-90"
                    : "border border-neutral-800 bg-neutral-950 text-neutral-200 hover:bg-neutral-900",
                ].join(" ")}
              >
                {isUnlimited ? "Abrir →" : "Ver →"}
              </Link>

              {!isUnlimited ? (
                <span className="inline-flex items-center rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-semibold text-fuchsia-200">
                  Requiere Pro Unlimited
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-semibold text-fuchsia-200">
                  Pro Unlimited
                </span>
              )}
            </div>

            {/* Overlay suave si no es unlimited */}
            {!isUnlimited ? (
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-neutral-950/0 to-neutral-950/30" />
            ) : null}
          </div>

          {/* Prompt Generator (placeholder / próximamente) */}
          <div className="relative rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                  Prompt Generator
                  <span className="inline-flex items-center rounded-full border border-neutral-700 bg-neutral-950 px-2 py-0.5 text-xs font-semibold text-neutral-300">
                    Próximamente
                  </span>
                </div>
                <p className="mt-2 text-sm text-neutral-400">
                  Genera prompts desde cero por objetivo, industria y formato.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <div className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-400">
                No disponible
              </div>

              {!isPro ? (
                <Link
                  href="/dashboard/upgrade"
                  className="inline-flex items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-200 hover:bg-amber-500/15 transition"
                >
                  Pro para early-access →
                </Link>
              ) : (
                <div className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-300">
                  Te avisamos cuando salga
                </div>
              )}
            </div>

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-neutral-950/25" />
          </div>
        </div>
      </section>
    </div>
  );
}
