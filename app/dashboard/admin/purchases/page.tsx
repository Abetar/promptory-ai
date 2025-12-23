export const runtime = "nodejs";

import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { approvePurchaseAction, rejectPurchaseAction } from "./actions";

export default async function AdminPurchasesPage() {
  await requireAdmin();

  const purchases = await prisma.packPurchase.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }], // pending primero
    take: 200,
    select: {
      id: true,
      status: true,
      amountMx: true,
      mpPaymentId: true,
      note: true,
      createdAt: true,
      approvedAt: true,
      rejectedAt: true,
      user: { select: { id: true, email: true, name: true } },
      pack: { select: { id: true, title: true, slug: true, priceMx: true, isFree: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin · Compras</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Historial y validación manual de compras de packs.
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
          <div className="col-span-4">Usuario</div>
          <div className="col-span-4">Pack</div>
          <div className="col-span-2">Estado</div>
          <div className="col-span-2 text-right">Acciones</div>
        </div>

        <div className="divide-y divide-neutral-800">
          {purchases.map((p) => {
            const statusBadge =
              p.status === "approved"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                : p.status === "rejected"
                ? "border-red-500/30 bg-red-500/10 text-red-200"
                : "border-amber-500/30 bg-amber-500/10 text-amber-200";

            const statusText =
              p.status === "approved" ? "Aprobada" : p.status === "rejected" ? "Rechazada" : "Pendiente";

            const created = p.createdAt.toISOString().replace("T", " ").slice(0, 16);

            return (
              <div
                key={p.id}
                className="grid grid-cols-12 items-start gap-0 px-4 py-3 bg-neutral-900/30"
              >
                <div className="col-span-12 md:col-span-4">
                  <div className="text-sm font-semibold text-neutral-100">
                    {p.user.email ?? p.user.id}
                  </div>
                  <div className="text-xs text-neutral-500">{p.user.name ?? ""}</div>
                  <div className="mt-1 text-xs text-neutral-500">{created}</div>
                </div>

                <div className="col-span-12 md:col-span-4 mt-3 md:mt-0">
                  <div className="text-sm text-neutral-200">{p.pack.title}</div>
                  <div className="text-xs text-neutral-500">/{p.pack.slug}</div>
                  <div className="mt-1 text-xs text-neutral-400">
                    Monto: <span className="text-neutral-200 font-semibold">${p.amountMx} MXN</span>
                    {p.mpPaymentId ? (
                      <span className="ml-2 text-neutral-500">· MP: {p.mpPaymentId}</span>
                    ) : null}
                  </div>
                  {p.note ? <div className="mt-1 text-xs text-neutral-500">Nota: {p.note}</div> : null}
                </div>

                <div className="col-span-6 md:col-span-2 mt-3 md:mt-0">
                  <span className={`text-xs rounded-full border px-2 py-1 ${statusBadge}`}>
                    {statusText}
                  </span>
                </div>

                <div className="col-span-6 md:col-span-2 mt-3 md:mt-0 flex justify-end gap-2">
                  {p.status === "pending" ? (
                    <>
                      <form
                        action={async () => {
                          "use server";
                          await approvePurchaseAction(p.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded-xl bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
                        >
                          Aprobar
                        </button>
                      </form>

                      <form
                        action={async () => {
                          "use server";
                          await rejectPurchaseAction(p.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/15 transition"
                        >
                          Rechazar
                        </button>
                      </form>
                    </>
                  ) : (
                    <span className="text-xs text-neutral-500">—</span>
                  )}
                </div>
              </div>
            );
          })}

          {purchases.length === 0 ? (
            <div className="px-4 py-10 text-center text-neutral-400">
              Aún no hay compras registradas.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
