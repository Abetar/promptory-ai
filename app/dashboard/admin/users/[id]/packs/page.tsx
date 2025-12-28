// app/dashboard/admin/users/[id]/packs/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

async function getParamsId(params: PageProps["params"]) {
  // Next 16 (turbopack) a veces lo entrega como Promise
  const p = params instanceof Promise ? await params : params;
  return p?.id;
}

export default async function AdminUserPacksPage({ params }: PageProps) {
  await requireAdmin();

  const userId = await getParamsId(params);
  if (!userId) notFound();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user) notFound();

  const packs = await prisma.userPack.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      createdAt: true,
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
            Admin · Packs del usuario
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            {user.email ?? "sin email"} {user.name ? `· ${user.name}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/admin/users/${userId}/guardados`}
            className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
          >
            Ver guardados →
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
          <div className="min-w-[860px]">
            <div className="grid grid-cols-12 bg-neutral-950 px-4 py-3 text-xs text-neutral-400">
              <div className="col-span-6">Pack</div>
              <div className="col-span-2">Precio</div>
              <div className="col-span-2">Publicado</div>
              <div className="col-span-2 text-right">Asignado</div>
            </div>

            <div className="divide-y divide-neutral-800">
              {packs.map((p, idx) => (
                <div
                  key={`${p.pack.id}-${idx}`}
                  className="grid grid-cols-12 items-center px-4 py-3 bg-neutral-900/30"
                >
                  <div className="col-span-6">
                    <div className="text-sm font-semibold text-neutral-100">
                      {p.pack.title}
                    </div>
                    <div className="text-xs text-neutral-500">{p.pack.slug}</div>
                  </div>

                  <div className="col-span-2 text-sm text-neutral-300">
                    {p.pack.isFree ? "Gratis" : `$${p.pack.priceMx} MXN`}
                  </div>

                  <div className="col-span-2">
                    {p.pack.isPublished ? (
                      <span className="text-xs rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200">
                        Sí
                      </span>
                    ) : (
                      <span className="text-xs rounded-full border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-300">
                        No
                      </span>
                    )}
                  </div>

                  <div className="col-span-2 text-right text-sm text-neutral-300">
                    {p.createdAt.toISOString().slice(0, 10)}
                  </div>
                </div>
              ))}

              {packs.length === 0 ? (
                <div className="px-4 py-10 text-center text-neutral-400">
                  Este usuario no tiene packs asignados.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
