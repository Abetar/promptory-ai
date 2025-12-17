import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { createAiToolAction, toggleAiToolActiveAction, deleteAiToolAction } from "./actions";

export const runtime = "nodejs";

export default async function AdminAiToolsPage() {
  await requireAdmin();

  const aiTools = await prisma.aiTool.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, isActive: true, createdAt: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin · AIs</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Agrega nuevas herramientas/modelos (Sora, etc.) y controla si aparecen en filtros.
        </p>
      </div>

      {/* Form nuevo */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5">
        <form action={createAiToolAction as any} className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm text-neutral-300">Nombre</label>
            <input
              name="name"
              placeholder="Sora"
              className="h-11 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-200 outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-neutral-300">Slug</label>
            <input
              name="slug"
              placeholder="sora"
              className="h-11 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-200 outline-none"
              required
            />
            <p className="text-xs text-neutral-500">minúsculas + guiones. ej: nano-banana</p>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="h-11 w-full rounded-xl bg-neutral-100 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
            >
              + Agregar AI
            </button>
          </div>
        </form>
      </div>

      {/* Lista */}
      <div className="rounded-2xl border border-neutral-800 overflow-hidden">
        <div className="grid grid-cols-12 bg-neutral-950 px-4 py-3 text-xs text-neutral-400">
          <div className="col-span-5">Nombre</div>
          <div className="col-span-4">Slug</div>
          <div className="col-span-1">Activa</div>
          <div className="col-span-2 text-right">Acciones</div>
        </div>

        <div className="divide-y divide-neutral-800">
          {aiTools.map((t) => (
            <div
              key={t.id}
              className="grid grid-cols-12 items-center px-4 py-3 bg-neutral-900/30"
            >
              <div className="col-span-5">
                <div className="text-sm font-semibold text-neutral-100">{t.name}</div>
              </div>

              <div className="col-span-4 text-sm text-neutral-300">{t.slug}</div>

              <div className="col-span-1">
                {t.isActive ? (
                  <span className="text-xs rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200">
                    Sí
                  </span>
                ) : (
                  <span className="text-xs rounded-full border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-300">
                    No
                  </span>
                )}
              </div>

              <div className="col-span-2 flex justify-end gap-2">
                <form action={async () => { "use server"; await toggleAiToolActiveAction(t.id); }}>
                  <button
                    type="submit"
                    className="rounded-xl border border-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
                  >
                    {t.isActive ? "Desactivar" : "Activar"}
                  </button>
                </form>

                <form action={async () => { "use server"; await deleteAiToolAction(t.id); }}>
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

          {aiTools.length === 0 ? (
            <div className="px-4 py-10 text-center text-neutral-400">
              No hay AIs. Agrega la primera.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
