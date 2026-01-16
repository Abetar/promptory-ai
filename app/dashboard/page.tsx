// app/dashboard/page.tsx
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { hasActiveSubscription, hasUnlimitedSubscription } from "@/lib/subscription";
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

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-2 inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-200">
      {children}
    </span>
  );
}

function getBasicCheckoutUrl() {
  return (process.env.SUBSCRIPTION_BASIC_CHECKOUT_URL ?? "").trim();
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const name =
    session?.user?.name?.split(" ")[0] ||
    session?.user?.email?.split("@")[0] ||
    "usuario";

  const isAdmin = isAdminEmail(session?.user?.email);

  const userId = (session?.user as any)?.id as string | undefined;
  const userEmail = session?.user?.email ?? null;

  const isPro = await hasActiveSubscription();
  const isUnlimited = await hasUnlimitedSubscription();

  const pendingMyRequests = userEmail
    ? await prisma.promptRequest.count({
        where: { userEmail, resolvedAt: null },
      })
    : 0;

  const basicCheckoutUrl = getBasicCheckoutUrl();

  // =========================
  // Banner de change-requests (cancel / downgrade)
  // =========================
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const changeReq = userId
    ? await prisma.subscriptionChangeRequest.findFirst({
        where: {
          userId,
          OR: [
            { status: "pending" },
            { status: "approved", createdAt: { gte: sevenDaysAgo } },
          ],
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          status: true,
          createdAt: true,
        },
      })
    : null;

  const shouldShowChangeBanner =
    !!changeReq &&
    (changeReq.status === "pending" ||
      (changeReq.status === "approved" &&
        (changeReq.type !== "downgrade" || isUnlimited)));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Mejorar texto</h1>

          <p className="text-sm text-neutral-400 flex flex-wrap items-center gap-2">
            Bienvenido, <span className="text-neutral-200">{name}</span>
            {isUnlimited ? <ProUnlimitedBadge /> : isPro ? <ProBadge /> : null}
          </p>

          <div className="text-xs text-neutral-500">
            Pega un mensaje/correo/post →{" "}
            <span className="text-neutral-300">versión profesional lista</span>.
          </div>

          <div className="text-xs flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/requests"
              className="text-neutral-400 hover:text-neutral-200 transition"
            >
              Ver mis solicitudes →
            </Link>

            {pendingMyRequests > 0 ? (
              <span className="text-neutral-500">
                Tienes <span className="text-neutral-300 font-semibold">{pendingMyRequests}</span>{" "}
                request(s) en revisión.
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPro ? (
            <Link
              href="/dashboard/upgrade"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
            >
              Gestionar {isUnlimited ? "Unlimited" : "Pro"} →
            </Link>
          ) : null}

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

      {/* Banner de cambios (cancel/downgrade) */}
      {shouldShowChangeBanner ? (
        <section
          className={[
            "rounded-2xl border p-5",
            changeReq.status === "approved"
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-amber-500/30 bg-amber-500/10",
          ].join(" ")}
        >
          {changeReq.status === "pending" ? (
            <>
              <div className="text-sm font-semibold text-amber-200">
                Tu solicitud está en revisión
              </div>
              <p className="mt-1 text-sm text-amber-200/80">
                {changeReq.type === "downgrade"
                  ? "Solicitaste un downgrade a Pro Basic. Un admin la revisará y te notificaremos aquí cuando esté lista."
                  : "Solicitaste cancelación de tu suscripción. Un admin la revisará y te notificaremos aquí cuando esté lista."}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href="/dashboard/upgrade"
                  className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
                >
                  Ver detalles →
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-semibold text-emerald-200">
                Tu solicitud fue aprobada ✅
              </div>

              <p className="mt-1 text-sm text-emerald-200/80">
                {changeReq.type === "downgrade" ? (
                  <>
                    Tu downgrade a Pro Basic ya está listo. Para completar el cambio,
                    abre el link y activa Pro Basic.
                    <span className="block mt-2 text-emerald-200/80">
                      <b>Importante:</b> tu plan sigue siendo <b>Pro Unlimited</b>{" "}
                      hasta que completes el cambio en <b>Mercado Pago</b>.
                    </span>
                  </>
                ) : (
                  <>
                    Tu cancelación fue aprobada. Si sigues viendo cobros, revisa tu
                    suscripción en Mercado Pago.
                  </>
                )}
              </p>

              {changeReq.type === "downgrade" ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {basicCheckoutUrl ? (
                    <a
                      href={basicCheckoutUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
                    >
                      Activar Pro Basic →
                    </a>
                  ) : (
                    <div className="text-xs text-red-200">
                      Falta configurar <b>SUBSCRIPTION_BASIC_CHECKOUT_URL</b> en el env.
                    </div>
                  )}

                  <Link
                    href="/dashboard/upgrade"
                    className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
                  >
                    Ir a Suscripción →
                  </Link>
                </div>
              ) : null}
            </>
          )}
        </section>
      ) : null}

      {/* HERO TOOL (primero y dominante) */}
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold text-neutral-100">
              Mejorar texto (principal)
            </div>
            <p className="mt-2 text-sm text-neutral-400">
              Pega un mensaje, correo o post y obtén una versión clara y profesional
              en segundos.
            </p>
            <p className="mt-2 text-xs text-neutral-500">
              Recomendación: empieza con WhatsApp → luego Email → luego LinkedIn.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/tools/prompt-optimizer"
              className="inline-flex items-center justify-center rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
            >
              Abrir →
            </Link>

            {/* ✅ Venta: SOLO aquí si no es Pro */}
            {!isPro ? (
              <Link
                href="/dashboard/upgrade"
                className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
              >
                Desbloquear Pro →
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {/* ✅ Venta única (solo si NO es pro) */}
      {!isPro ? (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-amber-200">Promptory Pro</div>
              <p className="mt-1 text-sm text-amber-200/80">
                Más runs diarios, mejor consistencia y acceso anticipado a nuevas herramientas.
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
                Probar herramienta →
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* Herramientas (solo lo “normal” visible) */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Herramientas</h2>
          <p className="mt-1 text-sm text-neutral-400">
            Tu producto vive aquí. La biblioteca es secundaria.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/dashboard/tools/prompt-optimizer"
            className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
          >
            <div className="text-sm font-semibold text-neutral-100">Mejorar texto</div>
            <p className="mt-2 text-sm text-neutral-400">
              WhatsApp · Email · LinkedIn · General. Texto listo o modo PROMPT.
            </p>
            <div className="mt-4 inline-flex rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950">
              Abrir →
            </div>
          </Link>

          {/* Avanzadas colapsables (ocultas por defecto) */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
            <details className="group">
              <summary className="cursor-pointer list-none flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-neutral-100">
                    Herramientas avanzadas
                  </div>
                  <p className="mt-1 text-sm text-neutral-400">
                    Solo si ya sabes lo que buscas.
                  </p>
                </div>
                <span className="text-sm text-neutral-400 group-open:text-neutral-200 transition">
                  Ver →
                </span>
              </summary>

              <div className="mt-4 space-y-3">
                <Link
                  href="/dashboard/tools/optimizer-unlimited"
                  className="block rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-200 hover:bg-neutral-900 transition"
                >
                  Ultimate (NSFW) {isUnlimited ? "— Abrir" : "— Requiere Unlimited"}
                </Link>

                <Link
                  href="/dashboard/tools"
                  className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
                >
                  Ver todas →
                </Link>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Biblioteca colapsable */}
      <section className="space-y-3">
        <details className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
          <summary className="cursor-pointer list-none flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Biblioteca</h2>
              <p className="mt-1 text-sm text-neutral-400">
                Ejemplos y recursos (opcional).
              </p>
            </div>
            <span className="text-sm text-neutral-300 hover:text-neutral-100 transition">
              Abrir →
            </span>
          </summary>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Link
              href="/dashboard/mis-prompts"
              className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-5 hover:bg-neutral-900/70 transition"
            >
              <div className="text-sm font-semibold text-neutral-100">Mis guardados</div>
              <p className="mt-2 text-sm text-neutral-400">
                Favoritos y guardados para acceso rápido.
              </p>
            </Link>

            <Link
              href="/dashboard/prompts"
              className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-5 hover:bg-neutral-900/70 transition"
            >
              <div className="text-sm font-semibold text-neutral-100">Explorar biblioteca</div>
              <p className="mt-2 text-sm text-neutral-400">
                Ejemplos por objetivo (trabajo, ventas, contenido).
              </p>
            </Link>

            <Link
              href="/dashboard/packs"
              className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-5 hover:bg-neutral-900/70 transition"
            >
              <div className="text-sm font-semibold text-neutral-100">Ejemplos premium</div>
              <p className="mt-2 text-sm text-neutral-400">
                Colecciones por resultado (no expiran).
              </p>
            </Link>

            <Link
              href="/dashboard/compras"
              className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-5 hover:bg-neutral-900/70 transition"
            >
              <div className="text-sm font-semibold text-neutral-100">Mis compras</div>
              <p className="mt-2 text-sm text-neutral-400">
                Revisa el estado de tus compras premium.
              </p>
            </Link>

            <Link
              href="/dashboard/requests"
              className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-5 hover:bg-neutral-900/70 transition md:col-span-2"
            >
              <div className="text-sm font-semibold text-neutral-100">
                Mis solicitudes
                {pendingMyRequests > 0 ? <Badge>{pendingMyRequests} en revisión</Badge> : null}
              </div>
              <p className="mt-2 text-sm text-neutral-400">
                Solicita nuevos ejemplos/plantillas por objetivo.
              </p>
            </Link>
          </div>
        </details>
      </section>
    </div>
  );
}
