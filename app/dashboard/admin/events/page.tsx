import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-950/40 px-2 py-0.5 text-[11px] font-semibold text-neutral-200">
      {children}
    </span>
  );
}

export default async function AdminEventsPage() {
  await requireAdmin();

  const events = await prisma.auditEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      event: true,
      emailSnapshot: true,
      entityType: true,
      entityId: true,
      createdAt: true,
      meta: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin · Events</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Logs simples para validar uso real (login, copy, tools, etc.).
          </p>
        </div>

        <Link
          href="/dashboard/admin"
          className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
        >
          ← Volver
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6">
          <div className="text-sm font-semibold text-neutral-100">
            Aún no hay eventos
          </div>
          <p className="mt-2 text-sm text-neutral-400">
            Cuando alguien inicie sesión, verás aquí el evento <Pill>auth.login</Pill>.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-900/60 text-neutral-300">
              <tr>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Evento</th>
                <th className="px-4 py-3 font-semibold">Usuario</th>
                <th className="px-4 py-3 font-semibold">Entidad</th>
                <th className="px-4 py-3 font-semibold">Meta</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-800 bg-neutral-900/30">
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-neutral-900/50 transition">
                  <td className="px-4 py-3 text-neutral-300">
                    {new Date(e.createdAt).toLocaleString("es-MX")}
                  </td>

                  <td className="px-4 py-3">
                    <Pill>{e.event}</Pill>
                  </td>

                  <td className="px-4 py-3 text-neutral-200">
                    {e.emailSnapshot ?? "—"}
                  </td>

                  <td className="px-4 py-3 text-neutral-200">
                    {e.entityType ? (
                      <span className="inline-flex items-center gap-2">
                        <Pill>{e.entityType}</Pill>
                        <span className="text-neutral-400">
                          {e.entityId ?? ""}
                        </span>
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="px-4 py-3 text-neutral-400">
                    {e.meta ? (
                      <span className="line-clamp-2">
                        {JSON.stringify(e.meta)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
