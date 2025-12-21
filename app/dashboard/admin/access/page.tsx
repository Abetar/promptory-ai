import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import AccessForm from "./AccessForm";

export const runtime = "nodejs";

export default async function AdminAccessPage() {
  await requireAdmin();

  const [users, prompts, accesses] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, email: true, name: true },
    }),
    prisma.prompt.findMany({
      where: { isFree: false }, // ✅ solo premium para otorgar acceso
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, title: true },
    }),
    prisma.userPromptAccess.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        userId: true,
        promptId: true,
        source: true,
        expiresAt: true,
        createdAt: true,
        user: { select: { email: true } },
        prompt: { select: { title: true } },
      },
    }),
  ]);

  const recent = accesses.map((r) => ({
    userId: r.userId,
    promptId: r.promptId,
    userEmail: r.user.email,
    promptTitle: r.prompt.title,
    source: r.source,
    expiresAt: r.expiresAt ? r.expiresAt.toISOString().slice(0, 10) : null,
    createdAt: r.createdAt.toISOString().replace("T", " ").slice(0, 16),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Admin · Accesos
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Otorga o revoca acceso a prompts premium por usuario.
          </p>
        </div>

        <Link
          href="/dashboard/admin"
          className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
        >
          ← Volver
        </Link>
      </div>

      {/* ✅ Aquí van los props que tu AccessForm necesita */}
      <AccessForm users={users} prompts={prompts} recent={recent} />
    </div>
  );
}
