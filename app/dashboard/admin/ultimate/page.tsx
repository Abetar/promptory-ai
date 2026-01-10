// app/dashboard/admin/ultimate/page.tsx
export const runtime = "nodejs";

import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

function asNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function asString(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v : null;
}

function fmtDate(d: Date) {
  // display simple: YYYY-MM-DD HH:mm
  const iso = d.toISOString(); // UTC
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;
}

export default async function AdminUltimateMetricsPage() {
  await requireAdmin();

  const events = await prisma.auditEvent.findMany({
    where: { event: "optimizer.ultimate.run" },
    orderBy: { createdAt: "desc" },
    take: 250,
    select: {
      id: true,
      createdAt: true,
      event: true,
      entityId: true,
      meta: true,
      emailSnapshot: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  // Normalizamos filas (meta viene como Json)
  const rows = events.map((e) => {
    const meta = (e.meta ?? {}) as any;

    const engine = asString(meta?.engine) ?? "—";
    const model = asString(meta?.model) ?? "—";
    const latencyMs = asNumber(meta?.latencyMs);
    const inputLength = asNumber(meta?.inputLength);

    const email =
      e.user?.email ??
      (e.emailSnapshot && e.emailSnapshot.trim() ? e.emailSnapshot : null) ??
      "(sin email)";

    const name = e.user?.name ?? "";

    return {
      id: e.id,
      createdAt: e.createdAt,
      email,
      name,
      engine,
      model,
      latencyMs,
      inputLength,
      entityId: e.entityId ?? null,
      userId: e.user?.id ?? null,
    };
  });

  const total = rows.length;
  const avgLatency =
    rows.length > 0
      ? Math.round(
          rows.reduce((acc, r) => acc + (r.latencyMs ?? 0), 0) / rows.length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Admin · Ultimate (NSFW) · Métricas
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Fuente: <span className="text-neutral-200">AuditEvent</span> donde{" "}
            <span className="text-neutral-200">event = "optimizer.ultimate.run"</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1 text-xs text-neutral-300">
            Eventos:{" "}
            <span className="ml-1 text-neutral-100 font-semibold">{total}</span>
            {total ? (
              <>
                <span className="mx-2 text-neutral-600">·</span>
                Avg latency:{" "}
                <span className="ml-1 text-neutral-100 font-semibold">
                  {avgLatency}ms
                </span>
              </>
            ) : null}
          </div>

          <Link
            href="/dashboard/admin"
            className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
          >
            ← Volver
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-neutral-800 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[1100px]">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-0 bg-neutral-950 px-4 py-3 text-xs text-neutral-400">
              <div className="col-span-4">Usuario</div>
              <div className="col-span-2">Fecha</div>
              <div className="col-span-2">Engine / Model</div>
              <div className="col-span-1 text-right">Latency</div>
              <div className="col-span-1 text-right">Len</div>
              <div className="col-span-2 text-right">Run ID</div>
            </div>

            <div className="divide-y divide-neutral-800">
              {rows.map((r) => (
                <div
                  key={r.id}
                  className="grid grid-cols-12 items-center gap-0 px-4 py-3 bg-neutral-900/30"
                >
                  {/* Usuario */}
                  <div className="col-span-4">
                    <div className="text-sm font-semibold text-neutral-100">
                      {r.email}
                    </div>
                    {r.name ? (
                      <div className="text-xs text-neutral-500">{r.name}</div>
                    ) : null}
                    {r.userId ? (
                      <div className="text-[11px] text-neutral-600">
                        userId: {r.userId}
                      </div>
                    ) : null}
                  </div>

                  {/* Fecha */}
                  <div className="col-span-2 text-sm text-neutral-300">
                    {fmtDate(r.createdAt)}
                  </div>

                  {/* Engine / Model */}
                  <div className="col-span-2">
                    <div className="text-sm text-neutral-200">
                      {r.engine}
                    </div>
                    <div className="text-xs text-neutral-500">{r.model}</div>
                  </div>

                  {/* Latency */}
                  <div className="col-span-1 text-right text-sm text-neutral-300">
                    {typeof r.latencyMs === "number" ? `${r.latencyMs}ms` : "—"}
                  </div>

                  {/* Len */}
                  <div className="col-span-1 text-right text-sm text-neutral-300">
                    {typeof r.inputLength === "number" ? r.inputLength : "—"}
                  </div>

                  {/* Run ID */}
                  <div className="col-span-2 text-right">
                    {r.entityId ? (
                      <span className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-950 px-2 py-1 text-[11px] text-neutral-300">
                        {r.entityId}
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-600">—</span>
                    )}
                  </div>
                </div>
              ))}

              {rows.length === 0 ? (
                <div className="px-4 py-10 text-center text-neutral-400">
                  Aún no hay eventos de Ultimate.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Nota */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/20 p-5">
        <div className="text-sm text-neutral-200 font-semibold">Notas</div>
        <ul className="mt-2 text-sm text-neutral-400 space-y-1">
          <li>
            • <span className="text-neutral-200">engine/model/latency/inputLength</span>{" "}
            se leen desde <span className="text-neutral-200">AuditEvent.meta</span>.
          </li>
          <li>
            • <span className="text-neutral-200">Run ID</span> ={" "}
            <span className="text-neutral-200">entityId</span> (el id de{" "}
            <span className="text-neutral-200">PromptOptimizerRun</span>).
          </li>
        </ul>
      </div>
    </div>
  );
}
