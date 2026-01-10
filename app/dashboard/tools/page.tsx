// app/dashboard/tools/page.tsx
export const runtime = "nodejs";

import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSubscriptionSnapshot } from "@/lib/subscription";

type ToolItem = {
  slug: string;
  title: string;
  description: string;
  href: string;
  enabled: boolean; // si false => "Próximamente"
  requiresPro: boolean; // basic o unlimited
  requiresUnlimited?: boolean; // tier 2
  hidden?: boolean; // si true, no se muestra en el grid
};

function TierBadge({
  tier,
  status,
}: {
  tier: "none" | "basic" | "unlimited";
  status?: string | null;
}) {
  if (tier === "unlimited") {
    return (
      <span className="inline-flex items-center rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold text-fuchsia-200">
        Pro Unlimited {status === "pending" ? "(provisional)" : "activo"}
      </span>
    );
  }

  if (tier === "basic") {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
        Pro Basic {status === "pending" ? "(provisional)" : "activo"}
      </span>
    );
  }

  return null;
}

function ToolBadge({
  disabled,
  lockedByPro,
  lockedByUnlimited,
  requiresPro,
  requiresUnlimited,
}: {
  disabled: boolean;
  lockedByPro: boolean;
  lockedByUnlimited: boolean;
  requiresPro: boolean;
  requiresUnlimited?: boolean;
}) {
  const badgeClass = disabled
    ? "border-neutral-700 bg-neutral-950 text-neutral-400"
    : lockedByUnlimited
    ? "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-200"
    : lockedByPro
    ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
    : requiresUnlimited
    ? "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-200"
    : requiresPro
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
    : "border-neutral-800 bg-neutral-950 text-neutral-300";

  const badgeText = disabled
    ? "Próximamente"
    : requiresUnlimited
    ? "Unlimited"
    : requiresPro
    ? "Pro"
    : "Free";

  return (
    <span className={["text-xs rounded-full border px-2 py-1", badgeClass].join(" ")}>
      {badgeText}
    </span>
  );
}

function ToolStatusLine({
  disabled,
  lockedByPro,
  lockedByUnlimited,
}: {
  disabled: boolean;
  lockedByPro: boolean;
  lockedByUnlimited: boolean;
}) {
  const statusLine = disabled
    ? "Aún no disponible. Estamos construyéndola."
    : lockedByUnlimited
    ? "Requiere Pro Unlimited."
    : lockedByPro
    ? "Requiere suscripción Pro."
    : "Disponible.";

  return <div className="mt-4 text-xs text-neutral-500">{statusLine}</div>;
}

export default async function ToolsPage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = Boolean(session?.user?.email);

  // ✅ Una sola fuente de verdad (tier + status)
  const snap = isLoggedIn ? await getSubscriptionSnapshot() : null;
  const tier = (snap?.tier ?? "none") as "none" | "basic" | "unlimited";
  const hasPro = tier !== "none";
  const hasUnlimited = tier === "unlimited";

  const tools: ToolItem[] = [
    {
      slug: "prompt-optimizer",
      title: "Prompt Optimizer",
      description:
        "Pega tu prompt y obtén una versión optimizada (estructura, contexto, variables y formato).",
      href: "/dashboard/tools/prompt-optimizer",
      enabled: true,
      requiresPro: false,
    },

    // ✅ Optimizer Unlimited: se muestra en Tools siempre (como tarjeta),
    // pero se bloquea si no tienes Unlimited (NO se oculta).
    {
      slug: "optimizer-unlimited",
      title: "Optimizer Ultimate",
      description:
        "Optimización avanzada (Ultimate / NSFW). Output: solo prompts optimizados.",
      href: "/dashboard/tools/optimizer-unlimited",
      enabled: true,
      requiresPro: true,
      requiresUnlimited: true,
      hidden: false,
    },

    {
      slug: "prompt-generator",
      title: "Prompt Generator",
      description:
        "Genera prompts profesionales a partir de un objetivo, audiencia y formato esperado.",
      href: "/dashboard/tools/prompt-generator",
      enabled: false,
      requiresPro: true,
    },
  ];

  const visibleTools = tools.filter((t) => !t.hidden);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tools</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Herramientas para crear y mejorar prompts (Free / Pro).
          </p>
        </div>

        {/* Badge / CTA */}
        {hasPro ? (
          <TierBadge tier={tier} status={snap?.status ?? null} />
        ) : (
          <Link
            href="/dashboard/upgrade"
            className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
          >
            Activar Pro
          </Link>
        )}
      </div>

      {/* Not logged */}
      {!isLoggedIn ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5">
          <div className="text-sm font-semibold text-neutral-100">
            Inicia sesión para usar las herramientas
          </div>
          <p className="mt-1 text-sm text-neutral-400">
            Algunas tools requieren suscripción Pro.
          </p>

          <div className="mt-4">
            <Link
              href="/api/auth/signin"
              className="inline-flex items-center justify-center rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      ) : null}

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {visibleTools.map((t) => {
          const lockedByPro = t.requiresPro && !hasPro;
          const lockedByUnlimited = Boolean(t.requiresUnlimited) && !hasUnlimited;

          const locked = lockedByPro || lockedByUnlimited;
          const disabled = !t.enabled;

          const isUnlimitedCard = t.slug === "optimizer-unlimited";

          return (
            <div
              key={t.slug}
              className={[
                "relative rounded-2xl border border-neutral-800 p-5 transition overflow-hidden",
                disabled
                  ? "bg-neutral-950/30 opacity-75"
                  : "bg-neutral-900/30 hover:bg-neutral-900/50",
              ].join(" ")}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-lg font-semibold text-neutral-100">
                      {t.title}
                    </div>

                    {/* extra chip para Ultimate */}
                    {isUnlimitedCard ? (
                      <span className="inline-flex items-center rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-0.5 text-xs font-semibold text-fuchsia-200">
                        NSFW
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-1 text-sm text-neutral-400">{t.description}</p>
                </div>

                <ToolBadge
                  disabled={disabled}
                  lockedByPro={lockedByPro}
                  lockedByUnlimited={lockedByUnlimited}
                  requiresPro={t.requiresPro}
                  requiresUnlimited={t.requiresUnlimited}
                />
              </div>

              {/* Status line */}
              <ToolStatusLine
                disabled={disabled}
                lockedByPro={lockedByPro}
                lockedByUnlimited={lockedByUnlimited}
              />

              {/* Actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                {disabled ? (
                  <span className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-500">
                    Próximamente
                  </span>
                ) : (
                  <Link
                    href={t.href}
                    className={[
                      "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition",
                      locked
                        ? "border border-neutral-800 bg-neutral-950 text-neutral-200 hover:bg-neutral-900"
                        : "bg-neutral-100 text-neutral-950 hover:opacity-90",
                    ].join(" ")}
                  >
                    {locked ? "Ver detalles" : "Abrir"}
                  </Link>
                )}

                {!disabled && locked ? (
                  <Link
                    href="/dashboard/upgrade"
                    className={[
                      "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition",
                      lockedByUnlimited ? "bg-fuchsia-500" : "bg-amber-500",
                    ].join(" ")}
                  >
                    {lockedByUnlimited ? "Subir a Unlimited" : "Activar Pro"}
                  </Link>
                ) : null}
              </div>

              {/* Optional overlay for locked Ultimate (visual cue like screenshot vibe) */}
              {!disabled && lockedByUnlimited ? (
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-neutral-950/0 to-neutral-950/30" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
