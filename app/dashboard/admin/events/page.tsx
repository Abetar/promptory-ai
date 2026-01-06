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

function formatMeta(meta: unknown) {
  try {
    return JSON.stringify(meta);
  } catch {
    return "—";
  }
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
        <div className="overflow-x-auto rounded-2xl border border-neutral-800">
          <table className="min-w-[980px] w-full text-left text-sm">
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
              {events.map((e) => {
                const meta = (e.meta ?? null) as any;

                const isOptimizerRun = e.event === "optimizer.run";
                const inputPreview =
                  isOptimizerRun && meta?.inputPreview
                    ? String(meta.inputPreview)
                    : null;

                const fullInput =
                  isOptimizerRun && meta?.fullInput ? String(meta.fullInput) : null;

                const latencyMs =
                  isOptimizerRun && typeof meta?.latencyMs === "number"
                    ? meta.latencyMs
                    : null;

                const plan = isOptimizerRun && meta?.plan ? String(meta.plan) : null;
                const engine = isOptimizerRun && meta?.engine ? String(meta.engine) : null;
                const targetAI =
                  isOptimizerRun && meta?.targetAI ? String(meta.targetAI) : null;

                return (
                  <tr key={e.id} className="hover:bg-neutral-900/50 transition align-top">
                    <td className="px-4 py-3 text-neutral-300 whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleString("es-MX")}
                    </td>

                    <td className="px-4 py-3">
                      <Pill>{e.event}</Pill>
                    </td>

                    <td className="px-4 py-3 text-neutral-200">
                      <span className="block truncate max-w-[240px]">
                        {e.emailSnapshot ?? "—"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-neutral-200">
                      {e.entityType ? (
                        <span className="inline-flex items-center gap-2">
                          <Pill>{e.entityType}</Pill>
                          <span className="text-neutral-400 break-all">
                            {e.entityId ?? ""}
                          </span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="px-4 py-3 text-neutral-400">
                      {isOptimizerRun ? (
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Pill>optimizer.run</Pill>
                            {targetAI ? <Pill>{targetAI}</Pill> : null}
                            {plan ? <Pill>{plan}</Pill> : null}
                            {engine ? <Pill>{engine}</Pill> : null}
                            {latencyMs != null ? <Pill>{latencyMs}ms</Pill> : null}
                          </div>

                          <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3">
                            <div className="text-xs font-semibold text-neutral-200">
                              Prompt intentado
                            </div>

                            {inputPreview ? (
                              <div className="mt-2 text-sm text-neutral-200 whitespace-pre-wrap break-words">
                                {inputPreview}
                              </div>
                            ) : (
                              <div className="mt-2 text-sm text-neutral-500">—</div>
                            )}

                            {fullInput ? (
                              <details className="mt-2">
                                <summary className="cursor-pointer text-xs font-semibold text-neutral-300 hover:text-neutral-100 transition">
                                  Ver completo
                                </summary>
                                <div className="mt-2 text-sm text-neutral-200 whitespace-pre-wrap break-words">
                                  {fullInput}
                                </div>
                              </details>
                            ) : null}
                          </div>

                          {/* fallback: si quieres ver el JSON completo */}
                          <div className="text-xs text-neutral-500 break-all">
                            {meta ? formatMeta(meta) : "—"}
                          </div>
                        </div>
                      ) : e.meta ? (
                        <span className="line-clamp-2 break-all">
                          {formatMeta(e.meta)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
