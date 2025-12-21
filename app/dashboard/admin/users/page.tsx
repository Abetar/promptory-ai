import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 500, // ajustable
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: {
        select: {
          promptSaves: true,
          packs: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin · Usuarios</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Lista de cuentas registradas (Google login).
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
          <div className="col-span-5">Usuario</div>
          <div className="col-span-2">Guardados</div>
          <div className="col-span-2">Packs</div>
          <div className="col-span-3 text-right">Creado</div>
        </div>

        <div className="divide-y divide-neutral-800">
          {users.map((u) => (
            <div
              key={u.id}
              className="grid grid-cols-12 items-center gap-0 px-4 py-3 bg-neutral-900/30"
            >
              <div className="col-span-5">
                <div className="text-sm font-semibold text-neutral-100">
                  {u.email ?? "sin email"}
                </div>
                {u.name ? (
                  <div className="text-xs text-neutral-500">{u.name}</div>
                ) : null}
                <div className="text-[11px] text-neutral-600">{u.id}</div>
              </div>

              <div className="col-span-2 text-sm text-neutral-300">
                {u._count.promptSaves}
              </div>

              <div className="col-span-2 text-sm text-neutral-300">
                {u._count.packs}
              </div>

              <div className="col-span-3 text-right text-sm text-neutral-300">
                {u.createdAt.toISOString().slice(0, 10)}
              </div>
            </div>
          ))}

          {users.length === 0 ? (
            <div className="px-4 py-10 text-center text-neutral-400">
              Aún no hay usuarios.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
