export const runtime = "nodejs";

import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MisComprasPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Mis compras</h1>
        <p className="text-sm text-neutral-400">Inicia sesión para ver tu historial.</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
        >
          Volver
        </Link>
      </div>
    );
  }

  const purchases = await prisma.packPurchase.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      status: true,
      amountMx: true,
      createdAt: true,
      pack: { select: { title: true, slug: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mis compras</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Historial de solicitudes de compra (validación manual).
          </p>
        </div>

        <Link
          href="/dashboard"
          className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
        >
          ← Volver
        </Link>
      </div>

      <div className="rounded-2xl border border-neutral-800 overflow-hidden">
        <div className="grid grid-cols-12 gap-0 bg-neutral-950 px-4 py-3 text-xs text-neutral-400">
          <div className="col-span-6">Pack</div>
          <div className="col-span-3">Estado</div>
          <div className="col-span-3 text-right">Fecha</div>
        </div>

        <div className="divide-y divide-neutral-800">
          {purchases.map((p) => {
            const created = p.createdAt.toISOString().slice(0, 10);
            const status =
              p.status === "approved" ? "Aprobada" : p.status === "rejected" ? "Rechazada" : "Pendiente";

            const badge =
              p.status === "approved"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                : p.status === "rejected"
                ? "border-red-500/30 bg-red-500/10 text-red-200"
                : "border-amber-500/30 bg-amber-500/10 text-amber-200";

            return (
              <div key={p.id} className="grid grid-cols-12 items-center gap-0 px-4 py-3 bg-neutral-900/30">
                <div className="col-span-6">
                  <div className="text-sm font-semibold text-neutral-100">{p.pack.title}</div>
                  <div className="text-xs text-neutral-500">/{p.pack.slug}</div>
                  <div className="mt-1 text-xs text-neutral-400">${p.amountMx} MXN</div>
                </div>

                <div className="col-span-3">
                  <span className={`text-xs rounded-full border px-2 py-1 ${badge}`}>
                    {status}
                  </span>
                </div>

                <div className="col-span-3 text-right text-xs text-neutral-500">{created}</div>
              </div>
            );
          })}

          {purchases.length === 0 ? (
            <div className="px-4 py-10 text-center text-neutral-400">
              Aún no tienes compras registradas.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
