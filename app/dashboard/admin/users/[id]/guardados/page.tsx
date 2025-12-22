import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export default async function AdminUserSavedPromptsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true },
  });

  if (!user) return notFound();

  const saves = await prisma.promptSave.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    select: {
      createdAt: true,
      prompt: {
        select: {
          id: true,
          title: true,
          type: true,
          isFree: true,
          priceMx: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Guardados del usuario
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            {user.email ?? user.name ?? user.id}
          </p>
        </div>

        <Link
          href="/dashboard/admin/users"
          className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
        >
          ← Volver a usuarios
        </Link>
      </div>

      <div className="rounded-2xl border border-neutral-800 overflow-hidden">
        <div className="grid grid-cols-12 gap-0 bg-neutral-950 px-4 py-3 text-xs text-neutral-400">
          <div className="col-span-7">Prompt</div>
          <div className="col-span-3">Tipo</div>
          <div className="col-span-2 text-right">Guardado</div>
        </div>

        <div className="divide-y divide-neutral-800">
          {saves.map((s) => (
            <div
              key={`${s.prompt.id}-${s.createdAt.toISOString()}`}
              className="grid grid-cols-12 items-center gap-0 px-4 py-3 bg-neutral-900/30"
            >
              <div className="col-span-7">
                <Link
                  href={`/dashboard/prompts/${s.prompt.id}`}
                  className="text-sm font-semibold text-neutral-100 hover:underline"
                >
                  {s.prompt.title}
                </Link>
                <div className="mt-1 text-xs text-neutral-500">
                  {s.prompt.isFree ? (
                    "Gratis"
                  ) : (
                    <>Premium · ${s.prompt.priceMx} MXN</>
                  )}
                </div>
              </div>

              <div className="col-span-3 text-sm text-neutral-300">
                {s.prompt.type}
              </div>

              <div className="col-span-2 text-right text-sm text-neutral-300">
                {s.createdAt.toISOString().slice(0, 10)}
              </div>

              
            </div>
          ))}

          {saves.length === 0 ? (
            <div className="px-4 py-10 text-center text-neutral-400">
              Este usuario no tiene prompts guardados.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
