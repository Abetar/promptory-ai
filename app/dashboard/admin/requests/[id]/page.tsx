// app/dashboard/admin/requests/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { toggleResolvedAction } from "../actions";

export const runtime = "nodejs";

function StatusPill({ resolvedAt }: { resolvedAt: Date | null }) {
  const isResolved = Boolean(resolvedAt);

  return isResolved ? (
    <span className="text-xs rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200">
      Atendido
    </span>
  ) : (
    <span className="text-xs rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-200">
      Pendiente
    </span>
  );
}

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const request = await prisma.promptRequest.findUnique({
    where: { id },
    select: {
      id: true,
      userEmail: true,
      title: true,
      description: true,
      aiTool: true,
      createdAt: true,
      resolvedAt: true,
    },
  });

  if (!request) return notFound();

  const isResolved = Boolean(request.resolvedAt);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Admin · Request
            </h1>
            <StatusPill resolvedAt={request.resolvedAt ?? null} />
          </div>
          <p className="mt-1 text-sm text-neutral-400">
            Detalle completo de la solicitud.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/admin/requests"
            className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
          >
            ← Volver
          </Link>

          <form
            action={async () => {
              "use server";
              await toggleResolvedAction(request.id);
            }}
          >
            <button
              type="submit"
              className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
            >
              {isResolved ? "Reabrir" : "Marcar atendido"}
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 space-y-4">
        <div className="space-y-1">
          <div className="text-xs text-neutral-500">Título</div>
          <div className="text-lg font-semibold text-neutral-100">
            {request.title}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
            <div className="text-xs text-neutral-500">Usuario</div>
            <div className="mt-1 text-sm text-neutral-200">
              {request.userEmail}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
            <div className="text-xs text-neutral-500">AI solicitada</div>
            <div className="mt-1 text-sm text-neutral-200">
              {request.aiTool || "—"}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
            <div className="text-xs text-neutral-500">Creado</div>
            <div className="mt-1 text-sm text-neutral-200">
              {new Date(request.createdAt).toLocaleString("es-MX")}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-neutral-500">Descripción</div>
          <div className="whitespace-pre-wrap rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4 text-sm text-neutral-200">
            {request.description}
          </div>
        </div>

        {request.resolvedAt ? (
          <div className="text-xs text-neutral-500">
            Atendido el{" "}
            <span className="text-neutral-300">
              {new Date(request.resolvedAt).toLocaleString("es-MX")}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
