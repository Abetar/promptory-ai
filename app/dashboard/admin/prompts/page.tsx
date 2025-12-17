import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { deletePromptAction, togglePublishAction } from "./actions";

export const runtime = "nodejs";

export default async function AdminPromptsListPage() {
  await requireAdmin();

  const prompts = await prisma.prompt.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      type: true,
      isFree: true,
      priceMx: true,
      isPublished: true,
      createdAt: true,
      aiTools: { select: { aiTool: { select: { name: true, slug: true } } } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin · Prompts</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Lista, publica y edita prompts.
          </p>
        </div>

        <Link
          href="/dashboard/admin/prompts/new"
          className="inline-flex items-center justify-center rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950"
        >
          + Nuevo prompt
        </Link>
      </div>

      <div className="rounded-2xl border border-neutral-800 overflow-hidden">
        <div className="grid grid-cols-12 gap-0 bg-neutral-950 px-4 py-3 text-xs text-neutral-400">
          <div className="col-span-5">Título</div>
          <div className="col-span-2">Tipo</div>
          <div className="col-span-2">Precio</div>
          <div className="col-span-1">Live</div>
          <div className="col-span-2 text-right">Acciones</div>
        </div>

        <div className="divide-y divide-neutral-800">
          {prompts.map((p) => (
            <div key={p.id} className="grid grid-cols-12 items-center gap-0 px-4 py-3 bg-neutral-900/30">
              <div className="col-span-5">
                <div className="text-sm font-semibold text-neutral-100">{p.title}</div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {p.aiTools.slice(0, 4).map((x) => (
                    <span
                      key={x.aiTool.slug}
                      className="text-[11px] rounded-full border border-neutral-800 bg-neutral-950 px-2 py-0.5 text-neutral-300"
                    >
                      {x.aiTool.name}
                    </span>
                  ))}
                  {p.aiTools.length > 4 ? (
                    <span className="text-[11px] rounded-full border border-neutral-800 bg-neutral-950 px-2 py-0.5 text-neutral-500">
                      +{p.aiTools.length - 4}
                    </span>
                  ) : null}
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

              <div className="col-span-12 md:col-span-2 flex flex-wrap md:flex-nowrap items-center justify-start md:justify-end gap-2 mt-3 md:mt-0">
                <Link
                  href={`/dashboard/admin/prompts/${p.id}/edit`}
                  className="rounded-xl border border-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
                >
                  Editar
                </Link>

                <form action={async () => { "use server"; await togglePublishAction(p.id); }}>
                  <button
                    type="submit"
                    className="rounded-xl border border-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
                  >
                    {p.isPublished ? "Ocultar" : "Publicar"}
                  </button>
                </form>

                <form action={async () => { "use server"; await deletePromptAction(p.id); }}>
                  <button
                    type="submit"
                    className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200 hover:bg-red-500/15 transition"
                  >
                    Borrar
                  </button>
                </form>
              </div>
            </div>
          ))}

          {prompts.length === 0 ? (
            <div className="px-4 py-10 text-center text-neutral-400">
              No hay prompts. Crea el primero.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
