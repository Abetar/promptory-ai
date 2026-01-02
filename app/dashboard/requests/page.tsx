// app/dashboard/requests/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

function StatusPill({ resolvedAt }: { resolvedAt: Date | null }) {
  const isResolved = Boolean(resolvedAt);

  return isResolved ? (
    <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-200">
      Atendido
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-200">
      En revisión
    </span>
  );
}

export default async function MyRequestsPage() {
  const session = await getServerSession(authOptions);

  const userEmail = session?.user?.email ?? undefined;
  if (!userEmail) redirect("/api/auth/signin");

  const requests = await prisma.promptRequest.findMany({
    where: { userEmail },
    orderBy: { createdAt: "desc" },
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Mis requests
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Aquí ves el estado de tus solicitudes de nuevos prompts.
          </p>
        </div>

        <Link
          href="/dashboard/prompts"
          className="inline-flex w-fit rounded-xl border border-neutral-800 bg-neutral-900/30 px-4 py-2 text-sm font-semibold text-neutral-100 hover:bg-neutral-900/60 transition"
        >
          Explorar prompts →
        </Link>

        <Link
          href="/dashboard/solicitar-prompt"
          className="inline-flex w-fit rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-neutral-200 transition"
        >
          Solicitar nuevo prompt →
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6">
          <div className="text-sm font-semibold text-neutral-100">
            Aún no has enviado requests
          </div>
          <p className="mt-2 text-sm text-neutral-400">
            Cuando solicites un prompt nuevo, aparecerá aquí con su estado.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 hover:bg-neutral-900/50 transition"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-semibold text-neutral-100">
                      {r.title}
                    </div>
                    <StatusPill resolvedAt={r.resolvedAt ?? null} />
                    {r.aiTool ? (
                      <span className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-950/40 px-2 py-0.5 text-[11px] font-semibold text-neutral-200">
                        {r.aiTool}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 text-sm text-neutral-400 line-clamp-2">
                    {r.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                    <span>
                      Enviado:{" "}
                      <span className="text-neutral-300">
                        {new Date(r.createdAt).toLocaleString("es-MX")}
                      </span>
                    </span>

                    {r.resolvedAt ? (
                      <span>
                        Atendido:{" "}
                        <span className="text-neutral-300">
                          {new Date(r.resolvedAt).toLocaleString("es-MX")}
                        </span>
                      </span>
                    ) : (
                      <span className="text-neutral-400">
                        Te avisaremos aquí cuando esté listo.
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="inline-flex rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950">
                    {r.resolvedAt ? "Listo" : "En trámite"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
