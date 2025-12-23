// app/dashboard/admin/packs/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export default async function AdminPackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const pack = await prisma.pack.findUnique({
    where: { id },
    select: { id: true, title: true, slug: true, isFree: true, isPublished: true },
  });

  if (!pack) return notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin · Pack</h1>
          <p className="mt-1 text-sm text-neutral-400">{pack.title}</p>
        </div>

        <Link
          href="/dashboard/admin/packs"
          className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
        >
          ← Volver
        </Link>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {pack.isFree ? (
            <span className="text-xs rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200">
              Gratis
            </span>
          ) : (
            <span className="text-xs rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-200">
              Premium
            </span>
          )}

          {pack.isPublished ? (
            <span className="text-xs rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200">
              Publicado
            </span>
          ) : (
            <span className="text-xs rounded-full border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-300">
              Oculto
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/admin/packs/${pack.id}/prompts`}
            className="inline-flex items-center justify-center rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
          >
            Gestionar prompts del pack →
          </Link>

          <Link
            href={`/dashboard/packs/${pack.slug}`}
            className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
          >
            Ver en sitio
          </Link>
        </div>
      </div>
    </div>
  );
}
