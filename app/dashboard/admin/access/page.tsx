// app/dashboard/admin/access/page.tsx
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import AccessForm from "./AccessForm";

export const runtime = "nodejs";

export default async function AdminAccessPage() {
  await requireAdmin();

  const [users, prompts, promptAccesses, userPacks] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, email: true, name: true },
    }),
    prisma.prompt.findMany({
      where: { isFree: false },
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
    prisma.userPack.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        userId: true,
        packId: true,
        createdAt: true,
        user: { select: { email: true } },
        pack: { select: { title: true } },
      },
    }),
  ]);

  // lookup: última compra por (userId, packId)
  const userIds = Array.from(new Set(userPacks.map((x) => x.userId)));
  const packIds = Array.from(new Set(userPacks.map((x) => x.packId)));

  const lastPurchases = await prisma.packPurchase.findMany({
    where: {
      userId: { in: userIds.length ? userIds : ["__none__"] },
      packId: { in: packIds.length ? packIds : ["__none__"] },
    },
    orderBy: { createdAt: "desc" },
    take: 500, // suficiente para cubrir 200 packs y tener "la última"
    select: { userId: true, packId: true, status: true, createdAt: true },
  });

  const lastByKey = new Map<string, { status: string; createdAt: Date }>();
  for (const p of lastPurchases) {
    const key = `${p.userId}::${p.packId}`;
    if (!lastByKey.has(key)) {
      lastByKey.set(key, { status: p.status, createdAt: p.createdAt });
    }
  }

  // Normalizamos a filas para AccessForm (mezclamos prompt-access + pack-access)
  const recent = [
    ...promptAccesses.map((r) => ({
      kind: "prompt" as const,
      userId: r.userId,
      itemId: r.promptId,
      userEmail: r.user.email,
      itemTitle: r.prompt.title,
      source: r.source,
      status: "active",
      expiresAt: r.expiresAt ? r.expiresAt.toISOString().slice(0, 10) : null,
      createdAt: r.createdAt.toISOString().replace("T", " ").slice(0, 16),
    })),
    ...userPacks.map((up) => {
      const key = `${up.userId}::${up.packId}`;
      const last = lastByKey.get(key);
      return {
        kind: "pack" as const,
        userId: up.userId,
        itemId: up.packId,
        userEmail: up.user.email ?? up.userId,
        itemTitle: up.pack.title,
        source: "purchase",
        status: last?.status ?? "unknown",
        expiresAt: null,
        createdAt: up.createdAt.toISOString().replace("T", " ").slice(0, 16),
      };
    }),
  ].slice(0, 200);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin · Accesos</h1>
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

      <AccessForm users={users} prompts={prompts} recent={recent} />
    </div>
  );
}
