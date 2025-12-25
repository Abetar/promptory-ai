import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import AiToolForm from "./AiToolForm";
import AiToolRow from "./AiToolRow";

export const runtime = "nodejs";

export default async function AdminAiToolsPage() {
  await requireAdmin();

  const aiTools = await prisma.aiTool.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin · AIs</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Agrega nuevas herramientas/modelos (Sora, etc.) y controla si aparecen en filtros.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5">
        <AiToolForm />
      </div>

      <div className="rounded-2xl border border-neutral-800 overflow-hidden">
        <div className="grid grid-cols-12 bg-neutral-950 px-4 py-3 text-xs text-neutral-400">
          <div className="col-span-5">Nombre</div>
          <div className="col-span-4">Slug</div>
          <div className="col-span-1">Activa</div>
          <div className="col-span-2 text-right">Acciones</div>
        </div>

        <div className="divide-y divide-neutral-800">
          {aiTools.map((t) => (
            <AiToolRow
              key={t.id}
              id={t.id}
              name={t.name}
              slug={t.slug}
              isActive={t.isActive}
              createdAt={t.createdAt.toISOString()}
            />
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
