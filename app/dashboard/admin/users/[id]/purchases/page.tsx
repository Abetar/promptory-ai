// app/dashboard/admin/users/[id]/purchases/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

async function getParamsId(params: PageProps["params"]) {
  const p = params instanceof Promise ? await params : params;
  return p?.id;
}

function formatMx(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function statusPill(status: string) {
  const base =
    "text-xs rounded-full border px-2 py-1 inline-flex items-center";
  if (status === "approved")
    return `${base} border-emerald-500/30 bg-emerald-500/10 text-emerald-200`;
  if (status === "pending")
    return `${base} border-amber-500/30 bg-amber-500/10 text-amber-200`;
  if (status === "rejected")
    return `${base} border-red-500/30 bg-red-500/10 text-red-200`;
  return `${base} border-neutral-700 bg-neutral-900 text-neutral-300`;
}

export default async function AdminUserPurchasesPage({ params }: PageProps) {
  await requireAdmin();

  const userId = await getParamsId(params);
  if (!userId) notFound();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user) notFound();

  // ✅ Compras de packs (historial real)
  const purchases = await prisma.packPurchase.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      amountMx: true,
      status: true,
      mpPaymentId: true,
      note: true,
      createdAt: true,
      approvedAt: true,
      rejectedAt: true,
      pack: {
        select: {
          id: true,
          slug: true,
          title: true,
          isFree: true,
          priceMx: true,
          isPublished: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Admin · Compras del usuario
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            {user.email ?? "sin email"} {user.name ? `· ${user.name}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/admin/users/${userId}/packs`}
            className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
          >
            Ver packs asignados →
          </Link>

          <Link
            href="/dashboard/admin/users"
            className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
          >
            ← Volver
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-800 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-12 bg-neutral-950 px-4 py-3 text-xs text-neutral-400">
              <div className="col-span-4">Pack</div>
              <div className="col-span-2">Monto</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Pago</div>
              <div className="col-span-2 text-right">Fecha</div>
            </div>

            <div className="divide-y divide-neutral-800">
              {purchases.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-12 items-center px-4 py-3 bg-neutral-900/30"
                >
                  <div className="col-span-4">
                    <div className="text-sm font-semibold text-neutral-100">
                      {p.pack.title}
                    </div>
                    <div className="text-xs text-neutral-500">{p.pack.slug}</div>
                    {p.note ? (
                      <div className="mt-1 text-xs text-neutral-500">
                        Nota: <span className="text-neutral-300">{p.note}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="col-span-2 text-sm text-neutral-300">
                    {formatMx(p.amountMx)}
                  </div>

                  <div className="col-span-2">
                    <span className={statusPill(p.status)}>{p.status}</span>

                    {p.status === "approved" && p.approvedAt ? (
                      <div className="mt-1 text-xs text-neutral-500">
                        Aprobado:{" "}
                        <span className="text-neutral-300">
                          {p.approvedAt.toISOString().slice(0, 10)}
                        </span>
                      </div>
                    ) : null}

                    {p.status === "rejected" && p.rejectedAt ? (
                      <div className="mt-1 text-xs text-neutral-500">
                        Rechazado:{" "}
                        <span className="text-neutral-300">
                          {p.rejectedAt.toISOString().slice(0, 10)}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="col-span-2 text-sm text-neutral-300">
                    {p.mpPaymentId ? (
                      <span className="text-xs rounded-full border border-neutral-800 bg-neutral-950 px-2 py-1 text-neutral-300">
                        MP: {p.mpPaymentId}
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-500">—</span>
                    )}
                  </div>

                  <div className="col-span-2 text-right text-sm text-neutral-300">
                    {p.createdAt.toISOString().slice(0, 10)}
                  </div>
                </div>
              ))}

              {purchases.length === 0 ? (
                <div className="px-4 py-10 text-center text-neutral-400">
                  Este usuario no tiene compras registradas.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
