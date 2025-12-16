import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import SaveButton from "../prompts/SaveButton";
import { getSavedPromptIdsForCurrentUser } from "../prompts/save-actions";

export const runtime = "nodejs";

async function requireUserId() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    // Si te pasa esto, te falta inyectar user.id en el callback de NextAuth.
    throw new Error("Unauthorized");
  }

  return userId;
}

export default async function MisPromptsPage() {
  const userId = await requireUserId();

  const [savedIds, rows] = await Promise.all([
    getSavedPromptIdsForCurrentUser(),
    prisma.promptSave.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        prompt: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            isFree: true,
            priceMx: true,
            isPublished: true,
            aiTools: {
              select: {
                aiTool: { select: { slug: true, name: true } },
              },
            },
          },
        },
      },
    }),
  ]);

  // Solo mostramos publicados (si ocultas un prompt, no debe aparecer aquí)
  const prompts = rows.map((r) => r.prompt).filter((p) => p.isPublished);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mis prompts</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Tus prompts guardados (favoritos) para copiar rápido.
          </p>
        </div>

        <Link
          href="/dashboard/prompts"
          className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
        >
          Explorar catálogo
        </Link>
      </div>

      {/* Empty state */}
      {prompts.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 text-neutral-300">
          <div className="text-lg font-semibold">Aún no tienes guardados</div>
          <p className="mt-2 text-sm text-neutral-400">
            En el catálogo, usa el ícono de bookmark para guardar prompts aquí.
          </p>

          <div className="mt-4">
            <Link
              href="/dashboard/prompts"
              className="inline-flex items-center justify-center rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
            >
              Ir a Prompts →
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Count */}
          <div className="text-sm text-neutral-400">
            <span className="text-neutral-200 font-semibold">
              {prompts.length}
            </span>{" "}
            guardados
          </div>

          {/* Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {prompts.map((p) => {
              const aiBadges = p.aiTools.map((x) => x.aiTool).slice(0, 3);

              return (
                <div
                  key={p.id}
                  className="group rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 hover:bg-neutral-900/70 transition"
                >
                  {/* Top row (SaveButton fuera del Link para evitar navegación accidental) */}
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
                          Premium · ${p.priceMx} MXN
                        </span>
                      )}

                      <SaveButton
                        promptId={p.id}
                        saved={savedIds.has(p.id)}
                        variant="icon"
                      />
                    </div>
                  </div>

                  {/* Clickable content */}
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
                      <span className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition">
                        Abrir →
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
