// app/dashboard/admin/requests/page.tsx
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { deleteRequestAction, toggleResolvedAction } from "./actions";

export const runtime = "nodejs";

export default async function AdminRequestsPage() {
  await requireAdmin();

  // Orden: más nuevos primero
  const requests = await prisma.promptRequest.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      userEmail: true,
      title: true,
      description: true,
      aiTool: true,
      createdAt: true,
      // Si aún no agregas estos campos, quítalos del select
      resolvedAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Admin · Requests
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Solicitudes de prompts enviadas por usuarios.
          </p>
        </div>

        <Link
          href="/dashboard/admin"
          className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
        >
          ← Volver
        </Link>
      </div>

      <div className="rounded-2xl border border-neutral-800 overflow-hidden">
        <div className="grid grid-cols-12 gap-0 bg-neutral-950 px-4 py-3 text-xs text-neutral-400">
          <div className="col-span-5">Solicitud</div>
          <div className="col-span-3">Usuario</div>
          <div className="col-span-2">AI</div>
          <div className="col-span-2 text-right">Acciones</div>
        </div>

        <div className="divide-y divide-neutral-800">
          {requests.map((r) => {
            const isResolved = Boolean(r.resolvedAt);

            return (
              <div
                key={r.id}
                className="grid grid-cols-12 gap-0 px-4 py-3 bg-neutral-900/30"
              >
                <div className="col-span-12 md:col-span-5">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/admin/requests/${r.id}`}
                      className="text-sm font-semibold text-neutral-100 hover:underline"
                    >
                      {r.title}
                    </Link>

                    {isResolved ? (
                      <span className="text-xs rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200">
                        Resuelto
                      </span>
                    ) : (
                      <span className="text-xs rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-200">
                        Pendiente
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-neutral-400 line-clamp-3">
                    {r.description}
                  </p>

                  <div className="mt-2 text-xs text-neutral-500">
                    {new Date(r.createdAt).toLocaleString("es-MX")}
                  </div>
                </div>

                <div className="col-span-12 md:col-span-3 mt-3 md:mt-0">
                  <div className="text-sm text-neutral-200">{r.userEmail}</div>
                </div>

                <div className="col-span-12 md:col-span-2 mt-3 md:mt-0">
                  <div className="text-sm text-neutral-300">
                    {r.aiTool || "—"}
                  </div>
                </div>

                <div className="col-span-12 md:col-span-2 mt-4 md:mt-0 flex flex-wrap md:flex-nowrap items-center justify-start md:justify-end gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await toggleResolvedAction(r.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-xl border border-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
                    >
                      {isResolved ? "Reabrir" : "Marcar resuelto"}
                    </button>
                  </form>

                  <form
                    action={async () => {
                      "use server";
                      await deleteRequestAction(r.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200 hover:bg-red-500/15 transition"
                    >
                      Borrar
                    </button>
                  </form>
                </div>
              </div>
            );
          })}

          {requests.length === 0 ? (
            <div className="px-4 py-10 text-center text-neutral-400">
              No hay solicitudes todavía.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
