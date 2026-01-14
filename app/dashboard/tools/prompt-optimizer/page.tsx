// app/dashboard/tools/prompt-optimizer/page.tsx
export const runtime = "nodejs";

import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSubscriptionTier } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";
import PromptOptimizerClient from "./PromptOptimizerClient";

export default async function PromptOptimizerPage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = Boolean(session?.user?.email);

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
            Tendrás acceso Free con límites, o Pro (Basic / Unlimited).
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

  const userId = (session?.user as any)?.id as string | undefined;

  // ✅ Tier real (none | basic | unlimited)
  const tier = await getSubscriptionTier();
  const isPro = tier !== "none";

  // ✅ Traer Prompt Base (si existe)
  // Asume: model UserPromptBase { userId @unique, content String, updatedAt DateTime @updatedAt }
  const promptBase = userId
    ? await prisma.userPromptBase.findUnique({
        where: { userId },
        select: { content: true, updatedAt: true },
      })
    : null;

  const initialInput = promptBase?.content ?? "";

  const badgeClass =
    tier === "unlimited"
      ? "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-200"
      : tier === "basic"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
      : "border-neutral-800 bg-neutral-900/40 text-neutral-300";

  const badgeText =
    tier === "unlimited"
      ? "Pro Unlimited activo"
      : tier === "basic"
      ? "Pro Basic activo"
      : "Free (con límites)";

  const showUpgradeToBasic = tier === "none";
  const showUpgradeToUnlimited = tier === "basic";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div
            className={[
              "inline-flex items-center rounded-full border px-3 py-1 text-xs",
              badgeClass,
            ].join(" ")}
          >
            {badgeText}
          </div>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            Prompt Optimizer
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Pega tu prompt → recibe una versión mejor.
          </p>

          {/* ✅ micro-info si ya tiene Prompt Base */}
          {promptBase?.updatedAt ? (
            <p className="mt-2 text-xs text-neutral-500">
              Prompt Base cargado (última edición:{" "}
              {new Date(promptBase.updatedAt).toLocaleString()}
              ).
            </p>
          ) : (
            <p className="mt-2 text-xs text-neutral-500">
              Tip: crea tu Prompt Base para ahorrar tiempo cada vez.
            </p>
          )}
        </div>

        {/* ✅ CTA: upgrade */}
        {showUpgradeToBasic ? (
          <Link
            href="/dashboard/upgrade"
            className="mt-1 inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
          >
            Upgrade a Pro
          </Link>
        ) : showUpgradeToUnlimited ? (
          <Link
            href="/dashboard/upgrade?tier=unlimited"
            className="mt-1 inline-flex items-center justify-center rounded-xl bg-fuchsia-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
          >
            Upgrade a Unlimited
          </Link>
        ) : null}
      </div>

      {/* ✅ Pasamos Prompt Base para precargar el textarea */}
      <PromptOptimizerClient initialInput={initialInput} isPro={isPro} tier={tier} />
    </div>
  );
}
