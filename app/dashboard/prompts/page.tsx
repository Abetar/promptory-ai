import Link from "next/link";
import { listPrompts } from "@/lib/prompts";
import { listAiTools } from "@/lib/aiTools";
import PromptsFiltersBar from "@/app/components/prompts/PromptsFiltersBar";
import type { PromptType } from "@prisma/client";

// ✅ NUEVO
import SaveButton from "./SaveButton";
import { getSavedPromptIdsForCurrentUser } from "./save-actions";

export const runtime = "nodejs";

type PriceFilter = "all" | "free" | "premium";
type SortFilter = "new";

export default async function PromptsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;

  const type = (sp.type as PromptType | undefined) || undefined;
  const ai = sp.ai || undefined;
  const price = (sp.price as PriceFilter | undefined) || "all";

  // ✅ Ya no soportamos sort por precio (Prompt ya no tiene priceMx)
  const sort: SortFilter = "new";

  const q = sp.q || undefined;

  const [aiTools, prompts, savedIds] = await Promise.all([
    listAiTools(),
    listPrompts({ type, aiSlug: ai, price, sort, q }),
    getSavedPromptIdsForCurrentUser(), // ✅ NUEVO
  ]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Catálogo de Prompts
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Banco de prompts optimizados por herramienta de IA y tipo.
          </p>
        </div>

        <div className="flex flex-col gap-2 md:items-end">
          <div className="text-sm text-neutral-400">
            <span className="text-neutral-200 font-semibold">
              {prompts.length}
            </span>{" "}
            resultados
          </div>

          <Link
            href="/dashboard/solicitar-prompt"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
          >
            Solicitar prompt +
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <PromptsFiltersBar aiTools={aiTools} />

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {prompts.map((p) => {
          const aiBadges = p.aiTools.map((x) => x.aiTool).slice(0, 3);
          const locked = !p.isFree;

          return (
            <div
              key={p.id}
              className="group rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 hover:bg-neutral-900/70 transition"
            >
              {/* Top row: type + badges + save */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-wide text-neutral-400">
                  {p.type}
                </span>

                <div className="flex items-center gap-2">
                  {p.isFree ? (
                    <span className="text-xs rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200">
                      Gratis
                    </span>
                  ) : (
                    <span className="text-xs rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-200">
                      Incluido en pack
                    </span>
                  )}

                  {/* ✅ BOTÓN GUARDAR */}
                  <SaveButton promptId={p.id} saved={savedIds.has(p.id)} />
                </div>
              </div>

              {/* Click area */}
              <Link href={`/dashboard/prompts/${p.id}`} className="block">
                <h2 className="mt-3 text-lg font-semibold leading-snug text-neutral-100 group-hover:text-white">
                  {p.title}
                </h2>

                <p className="mt-2 text-sm text-neutral-400 line-clamp-3">
                  {p.description}
                </p>

                {/* AI badges */}
                {aiBadges.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {aiBadges.map((t) => (
                      <span
                        key={t.slug}
                        className="text-xs rounded-full border border-neutral-800 bg-neutral-950 px-2 py-1 text-neutral-300"
                      >
                        {t.name}
                      </span>
                    ))}
                    {p.aiTools.length > 3 ? (
                      <span className="text-xs rounded-full border border-neutral-800 bg-neutral-950 px-2 py-1 text-neutral-500">
                        +{p.aiTools.length - 3}
                      </span>
                    ) : null}
                  </div>
                )}

                {/* CTA */}
                <div className="mt-5">
                  {locked ? (
                    <span className="inline-flex items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-200 transition group-hover:bg-amber-500/20">
                      Ver preview
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition group-hover:opacity-90">
                      Ver prompt completo
                    </span>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {prompts.length === 0 && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 text-neutral-300">
          <div className="text-lg font-semibold">Sin resultados</div>
          <p className="mt-2 text-sm text-neutral-400">
            Prueba limpiar filtros o cambiar la búsqueda.
          </p>
        </div>
      )}
    </div>
  );
}
