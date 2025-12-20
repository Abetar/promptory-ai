export const runtime = "nodejs";

import { notFound } from "next/navigation";
import { getPromptById } from "@/lib/prompts";
import CopyPromptButton from "./CopyPromptButton";
import TranslateToEnglishCard from "./TranslateToEnglishCard"; // ✅ NUEVO

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const prompt = await getPromptById(id);
  if (!prompt) return notFound();

  const locked = !prompt.isFree;
  const text = locked ? prompt.contentPreview : prompt.contentFull;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs uppercase tracking-wide text-neutral-400">
            {prompt.type}
          </span>

          {prompt.isFree ? (
            <span className="text-xs rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200">
              Gratis
            </span>
          ) : (
            <span className="text-xs rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-200">
              Premium · ${prompt.priceMx} MXN
            </span>
          )}
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">{prompt.title}</h1>
        <p className="text-sm text-neutral-400">{prompt.description}</p>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-neutral-100">Prompt</h2>
          {!locked ? <CopyPromptButton text={text} /> : null}
        </div>

        <pre className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-200">
          {text}
        </pre>
      </div>

      {/* ✅ NUEVO: Traducción on-the-fly (solo si está desbloqueado) */}
      {!locked ? <TranslateToEnglishCard text={text} /> : null}

      {locked && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="font-semibold text-amber-200">Prompt premium</p>
          <p className="mt-1 text-sm text-amber-200/80">
            Desbloquea por ${prompt.priceMx} MXN (pagos próximamente)
          </p>

          <button
            disabled
            className="mt-3 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 opacity-60"
            title="Pagos aún no implementados"
          >
            Comprar
          </button>
        </div>
      )}
    </div>
  );
}
