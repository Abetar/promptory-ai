// app/dashboard/admin/users/page.tsx
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { grantProAction, revokeProAction } from "./actions";

export const runtime = "nodejs";

function isActiveByDates(endsAt: Date | null) {
  if (!endsAt) return true;
  return endsAt.getTime() > Date.now();
}

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      subscription: {
        select: {
          status: true,
          endsAt: true,
          startsAt: true,
        },
      },
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
          <h1 className="text-2xl font-semibold tracking-tight">
            Admin · Usuarios
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Lista de cuentas registradas (Google login) + control Pro manual.
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
        {/* scroll horizontal en mobile */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[920px]">
            {/* Header */}
            <div className="grid grid-cols-12 gap-0 bg-neutral-950 px-4 py-3 text-xs text-neutral-400">
              <div className="col-span-4">Usuario</div>
              <div className="col-span-2">Pro</div>
              <div className="col-span-1">Guardados</div>
              <div className="col-span-1">Packs</div>
              <div className="col-span-2 text-right">Creado</div>
              <div className="col-span-2 text-right">Acciones</div>
            </div>

            {/* Body */}
            <div className="divide-y divide-neutral-800">
              {users.map((u) => {
                const sub = u.subscription;
                const isPro =
                  sub?.status === "approved" &&
                  isActiveByDates(sub.endsAt ?? null);

                const proLabel = !sub
                  ? "No"
                  : sub.status === "approved"
                  ? isActiveByDates(sub.endsAt ?? null)
                    ? "Activo"
                    : "Vencido"
                  : sub.status === "pending"
                  ? "Pendiente"
                  : sub.status === "rejected"
                  ? "Rechazado"
                  : "Cancelado";

                return (
                  <div
                    key={u.id}
                    className="grid grid-cols-12 items-center gap-0 px-4 py-3 bg-neutral-900/30"
                  >
                    <div className="col-span-4">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-neutral-100">
                          {u.email ?? "sin email"}
                        </div>

                        {isPro ? (
                          <span className="text-[11px] rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-200">
                            PRO
                          </span>
                        ) : null}
                      </div>

                      {u.name ? (
                        <div className="text-xs text-neutral-500">{u.name}</div>
                      ) : null}
                      <div className="text-[11px] text-neutral-600">{u.id}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Link
                          href={`/dashboard/admin/users/${u.id}/guardados`}
                          className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-900 transition"
                        >
                          Ver guardados →
                        </Link>

                        <Link
                          href={`/dashboard/admin/users/${u.id}/packs`}
                          className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-900 transition"
                        >
                          Ver packs →
                        </Link>

                        <Link
                          href={`/dashboard/admin/users/${u.id}/purchases`}
                          className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-900 transition"
                        >
                          Ver compras →
                        </Link>
                      </div>
                    </div>

                    <div className="col-span-2">
                      {isPro ? (
                        <div className="space-y-1">
                          <span className="inline-flex text-xs rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200">
                            {proLabel}
                          </span>
                          {sub?.endsAt ? (
                            <div className="text-[11px] text-neutral-500">
                              vence: {sub.endsAt.toISOString().slice(0, 10)}
                            </div>
                          ) : (
                            <div className="text-[11px] text-neutral-500">
                              sin vencimiento
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex text-xs rounded-full border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-300">
                          {proLabel}
                        </span>
                      )}
                    </div>

                    <div className="col-span-1 text-sm text-neutral-300">
                      {u._count.promptSaves}
                    </div>

                    <div className="col-span-1 text-sm text-neutral-300">
                      {u._count.packs}
                    </div>

                    <div className="col-span-2 text-right text-sm text-neutral-300">
                      {u.createdAt.toISOString().slice(0, 10)}
                    </div>

                    <div className="col-span-2 flex justify-end gap-2">
                      {!isPro ? (
                        <form
                          action={async () => {
                            "use server";
                            await grantProAction(u.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="rounded-xl bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-950 hover:opacity-90 transition"
                          >
                            Dar Pro
                          </button>
                        </form>
                      ) : (
                        <form
                          action={async () => {
                            "use server";
                            await revokeProAction(u.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/15 transition"
                          >
                            Revocar
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                );
              })}

              {users.length === 0 ? (
                <div className="px-4 py-10 text-center text-neutral-400">
                  Aún no hay usuarios.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
