// app/dashboard/admin/packs/[id]/prompts/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { togglePromptInPackAction } from "./actions";

export const runtime = "nodejs";

export default async function PackPromptsAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id: packId } = await params;

  const pack = await prisma.pack.findUnique({
    where: { id: packId },
    select: { id: true, title: true, slug: true },
  });
  if (!pack) return notFound();

  const [allPrompts, included] = await Promise.all([
    prisma.prompt.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        type: true,
        isFree: true,
        priceMx: true,
        isPublished: true,
      },
    }),
    prisma.packPrompt.findMany({
      where: { packId },
      select: { promptId: true },
    }),
  ]);

  const includedSet = new Set(included.map((x) => x.promptId));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Pack · Prompts
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            {pack.title} — asigna prompts al pack (sin orden).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/admin/packs"
            className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
          >
            ← Volver
          </Link>
          <Link
            href={`/dashboard/packs/${pack.slug}`}
            className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
          >
            Ver pack
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-800 overflow-hidden">
        <div className="grid grid-cols-12 gap-0 bg-neutral-950 px-4 py-3 text-xs text-neutral-400">
          <div className="col-span-6">Prompt</div>
          <div className="col-span-2">Tipo</div>
          <div className="col-span-2">Precio</div>
          <div className="col-span-1">Live</div>
          <div className="col-span-1 text-right">En pack</div>
        </div>

        <div className="divide-y divide-neutral-800">
          {allPrompts.map((p) => {
            const isIn = includedSet.has(p.id);

            return (
              <div
                key={p.id}
                className="grid grid-cols-12 items-center gap-0 px-4 py-3 bg-neutral-900/30"
              >
                <div className="col-span-6">
                  <div className="text-sm font-semibold text-neutral-100">
                    {p.title}
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    {p.id}
                  </div>
                </div>

                <div className="col-span-2 text-sm text-neutral-300">{p.type}</div>

                <div className="col-span-2 text-sm">
                  {p.isFree ? (
                    <span className="text-emerald-200">Gratis</span>
                  ) : (
                    <span className="text-amber-200">${p.priceMx} MXN</span>
                  )}
                </div>

                <div className="col-span-1">
                  {p.isPublished ? (
                    <span className="text-xs rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200">
                      Sí
                    </span>
                  ) : (
                    <span className="text-xs rounded-full border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-300">
                      No
                    </span>
                  )}
                </div>

                <div className="col-span-1 flex justify-end">
                  <form
                    action={async () => {
                      "use server";
                      await togglePromptInPackAction(packId, p.id);
                    }}
                  >
                    <button
                      type="submit"
                      className={`rounded-xl border px-3 py-2 text-sm transition ${
                        isIn
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15"
                          : "border-neutral-800 text-neutral-200 hover:bg-neutral-900"
                      }`}
                    >
                      {isIn ? "Sí" : "No"}
                    </button>
                  </form>
                </div>
              </div>
            );
          })}

          {allPrompts.length === 0 ? (
            <div className="px-4 py-10 text-center text-neutral-400">
              No hay prompts todavía.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
