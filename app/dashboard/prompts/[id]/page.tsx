export const runtime = "nodejs";

import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPromptById } from "@/lib/prompts";
import { canAccessPrompt } from "@/lib/access";
import CopyPromptButton from "./CopyPromptButton";
// import TranslateToEnglishCard from "./TranslateToEnglishCard"; // futuro premium

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const prompt = await getPromptById(id);
  if (!prompt) return notFound();

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  // ✅ Determinar acceso real
  const hasAccess = prompt.isFree
    ? true
    : await canAccessPrompt({ userId, promptId: prompt.id });

  const locked = !hasAccess;
  const text = locked ? prompt.contentPreview : prompt.contentFull;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs uppercase tracking-wide text-neutral-400">
            {prompt.type}
          </span>

          {/* Badge de estado */}
          {prompt.isFree ? (
            <span className="text-xs rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200">
              Gratis
            </span>
          ) : hasAccess ? (
            <span className="text-xs rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200">
              Desbloqueado
            </span>
          ) : (
            <span className="text-xs rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-200">
              Premium · ${prompt.priceMx} MXN
            </span>
          )}
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">
          {prompt.title}
        </h1>
        <p className="text-sm text-neutral-400">
          {prompt.description}
        </p>
      </div>

      {/* Prompt content */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-neutral-100">Prompt</h2>
          {!locked ? <CopyPromptButton text={text} /> : null}
        </div>

        <pre className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-200">
          {text}
        </pre>
      </div>

      {/* Locked CTA */}
      {locked && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
          <div>
            <p className="font-semibold text-amber-200">
              Prompt premium
            </p>
            <p className="mt-1 text-sm text-amber-200/80">
              Este contenido está bloqueado. Desbloquéalo comprando el
              pack correspondiente o solicita acceso.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/packs"
              className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
            >
              Ver packs
            </Link>

            <Link
              href="/dashboard/soporte"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
            >
              Solicitar acceso
            </Link>
          </div>

          <p className="text-xs text-neutral-400">
            Acceso inmediato provisional disponible en packs premium.
          </p>
        </div>
      )}
    </div>
  );
}
