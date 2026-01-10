// app/dashboard/admin/subscriptions/page.tsx
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import {
  approveSubscriptionPurchaseAction,
  rejectSubscriptionPurchaseAction,
} from "./actions";
import type { SubscriptionTier } from "@prisma/client";

export const runtime = "nodejs";

function safeTier(tier: SubscriptionTier | null | undefined): SubscriptionTier {
  return tier === "unlimited" ? "unlimited" : "basic";
}

function tierBadge(tier: SubscriptionTier) {
  return tier === "unlimited" ? (
    <span className="text-xs rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-1 text-fuchsia-200">
      Pro Unlimited
    </span>
  ) : (
    <span className="text-xs rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-200">
      Pro Basic
    </span>
  );
}

export default async function AdminSubscriptionsPage() {
  await requireAdmin();

  const purchases = await prisma.subscriptionPurchase.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      status: true,
      tier: true,
      amountMx: true,
      note: true,
      mpPaymentId: true,
      createdAt: true,
      approvedAt: true,
      rejectedAt: true,
      user: { select: { id: true, email: true, name: true } },
    },
  });

  const pendingRaw = purchases.filter((p) => p.status === "pending");
  const others = purchases.filter((p) => p.status !== "pending");

  // ✅ Prioriza Unlimited arriba en pendientes
  const pending = pendingRaw.sort((a, b) => {
    const ta = safeTier(a.tier);
    const tb = safeTier(b.tier);
    if (ta === tb) return 0;
    return ta === "unlimited" ? -1 : 1;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Admin · Suscripciones Pro
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Solicitudes pendientes (acceso provisional activo hasta rechazar).
        </p>
      </div>

      {/* Pendientes */}
      <div className="rounded-2xl border border-neutral-800 overflow-hidden">
        <div className="bg-neutral-950 px-4 py-3 text-xs text-neutral-400">
          Pendientes ({pending.length})
        </div>

        <div className="divide-y divide-neutral-800">
          {pending.map((p) => {
            const tier = safeTier(p.tier);

            return (
              <div
                key={p.id}
                className="px-4 py-3 bg-neutral-900/30 flex flex-col gap-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold text-neutral-100">
                        {p.user?.email ?? "(sin email)"}
                        <span className="text-xs text-neutral-500">
                          {" "}
                          · ${p.amountMx} MXN
                        </span>
                      </div>

                      {/* Tier */}
                      {tierBadge(tier)}
                    </div>

                    <div className="text-xs text-neutral-500">
                      ID: <span className="text-neutral-400">{p.id}</span> ·{" "}
                      {new Date(p.createdAt).toLocaleString()}
                    </div>

                    {p.mpPaymentId ? (
                      <div className="text-xs text-neutral-500">
                        MP:{" "}
                        <span className="text-neutral-300">{p.mpPaymentId}</span>
                      </div>
                    ) : null}

                    {p.note ? (
                      <div className="text-xs text-neutral-500">
                        Nota: <span className="text-neutral-300">{p.note}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <form
                      action={async () => {
                        "use server";
                        await approveSubscriptionPurchaseAction(p.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
                      >
                        Aprobar
                      </button>
                    </form>

                    <form
                      action={async () => {
                        "use server";
                        await rejectSubscriptionPurchaseAction(p.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/15 transition"
                      >
                        Rechazar
                      </button>
                    </form>
                  </div>
                </div>

                <div className="text-xs text-amber-200/70 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                  Recordatorio: mientras esté <b>pending</b>, el usuario tiene{" "}
                  <b>{tier === "unlimited" ? "Pro Unlimited" : "Pro Basic"}</b>{" "}
                  provisional. Rechazar revoca el acceso.
                </div>
              </div>
            );
          })}

          {pending.length === 0 ? (
            <div className="px-4 py-10 text-center text-neutral-400">
              No hay solicitudes pendientes.
            </div>
          ) : null}
        </div>
      </div>

      {/* Historial */}
      <div className="rounded-2xl border border-neutral-800 overflow-hidden">
        <div className="bg-neutral-950 px-4 py-3 text-xs text-neutral-400">
          Historial ({others.length})
        </div>

        <div className="divide-y divide-neutral-800">
          {others.slice(0, 30).map((p) => {
            const tier = safeTier(p.tier);

            return (
              <div key={p.id} className="px-4 py-3 bg-neutral-900/20">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-200">
                    <span>{p.user?.email ?? "(sin email)"}</span>
                    <span className="text-neutral-500">·</span>
                    <span>${p.amountMx} MXN</span>

                    {tierBadge(tier)}
                  </div>

                  <div className="flex items-center gap-2">
                    {p.status === "approved" ? (
                      <span className="text-xs rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200">
                        Aprobada
                      </span>
                    ) : (
                      <span className="text-xs rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-red-200">
                        Rechazada
                      </span>
                    )}
                    <div className="text-xs text-neutral-500">
                      {new Date(p.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {p.mpPaymentId || p.note ? (
                  <div className="mt-2 text-xs text-neutral-500 space-y-1">
                    {p.mpPaymentId ? (
                      <div>
                        MP:{" "}
                        <span className="text-neutral-300">{p.mpPaymentId}</span>
                      </div>
                    ) : null}
                    {p.note ? (
                      <div>
                        Nota: <span className="text-neutral-300">{p.note}</span>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}

          {others.length === 0 ? (
            <div className="px-4 py-10 text-center text-neutral-400">
              No hay historial todavía.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
