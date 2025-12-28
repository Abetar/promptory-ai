export const runtime = "nodejs";

import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/subscription";

type ToolItem = {
  slug: string;
  title: string;
  description: string;
  href: string;
  enabled: boolean; // si false => "Próximamente" (deshabilitado)
  requiresPro: boolean; // si true => requiere suscripción Pro
};

export default async function ToolsPage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = Boolean(session?.user?.email);
  const hasPro = await hasActiveSubscription();

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
    // {
    //   slug: "prompt-optimizer-pro",
    //   title: "Prompt Optimizer Pro",
    //   description:
    //     "Pega tu prompt y obtén una versión optimizada (estructura, contexto, variables y formato). Usando AI de última generación.",
    //   href: "/dashboard/tools/prompt-optimizer",
    //   enabled: false,
    //   requiresPro: true,
    // },
    {
      slug: "prompt-generator",
      title: "Prompt Generator",
      description:
        "Genera prompts profesionales a partir de un objetivo, audiencia y formato esperado.",
      href: "/dashboard/tools/prompt-generator",
      enabled: false, // 👈 Próximamente
      requiresPro: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tools</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Herramientas para crear y mejorar prompts (suscripción Pro).
          </p>
        </div>

        {hasPro ? (
          <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
            Pro activo
          </span>
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
        {tools.map((t) => {
          const locked = t.requiresPro && !hasPro;
          const disabled = !t.enabled;

          const badge = disabled
            ? "border-neutral-700 bg-neutral-950 text-neutral-400"
            : locked
            ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";

          const badgeText = disabled
            ? "Próximamente"
            : t.requiresPro
            ? "Pro"
            : "Free";

          return (
            <div
              key={t.slug}
              className={[
                "rounded-2xl border border-neutral-800 p-5 transition",
                disabled
                  ? "bg-neutral-950/30 opacity-75"
                  : "bg-neutral-900/30 hover:bg-neutral-900/50",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-neutral-100">
                    {t.title}
                  </div>
                  <p className="mt-1 text-sm text-neutral-400">
                    {t.description}
                  </p>
                </div>

                <span
                  className={[
                    "text-xs rounded-full border px-2 py-1",
                    badge,
                  ].join(" ")}
                >
                  {badgeText}
                </span>
              </div>

              {/* Status line */}
              <div className="mt-4 text-xs text-neutral-500">
                {disabled
                  ? "Aún no disponible. Estamos construyéndola."
                  : locked
                  ? "Requiere suscripción Pro."
                  : "Disponible."}
              </div>

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
                    className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
                  >
                    Activar Pro
                  </Link>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
