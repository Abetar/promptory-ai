// app/dashboard/packs/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPackBySlug } from "@/lib/packs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PurchasePackButton from "./PurchasePackButton";

export const runtime = "nodejs";

export default async function PackDetailPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const { slug } = await Promise.resolve(params);

  const pack = await getPackBySlug(slug);
  if (!pack || !pack.isPublished) return notFound();

  const prompts = pack.prompts.map((pp) => pp.prompt);

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  const alreadyHasAccess = userId
    ? !!(await prisma.userPack.findUnique({
        where: { userId_packId: { userId, packId: pack.id } },
        select: { userId: true },
      }))
    : false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/packs"
              className="text-sm text-neutral-400 hover:text-neutral-200"
            >
              ← Volver a packs
            </Link>

            {pack.isFree ? (
              <span className="text-xs rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200">
                Gratis
              </span>
            ) : (
              <span className="text-xs rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-200">
                Premium · ${pack.priceMx} MXN
              </span>
            )}
          </div>

          {/* CTA Compra */}
          <PurchasePackButton
            packId={pack.id}
            isFree={pack.isFree}
            alreadyHasAccess={alreadyHasAccess}
          />
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{pack.title}</h1>
          <p className="mt-1 text-sm text-neutral-400">{pack.description}</p>
        </div>

        <div className="text-sm text-neutral-400">
          <span className="text-neutral-200 font-semibold">{prompts.length}</span>{" "}
          prompts incluidos
        </div>

        {/* {!pack.isFree && !alreadyHasAccess && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-100">
            <div className="font-semibold">Compra manual (MVP)</div>
            <p className="mt-1 text-sm text-amber-100/80">
              Al presionar “Comprar pack” se crea una solicitud. Un admin la
              aprobará manualmente y entonces se desbloquean los prompts.
            </p>
          </div>
        )} */}
      </div>

      {/* Grid prompts incluidos */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {prompts.map((p) => {
          const aiBadges = p.aiTools.map((x) => x.aiTool).slice(0, 3);
          const locked = !p.isFree;

          return (
            <div
              key={p.id}
              className="group rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 hover:bg-neutral-900/70 transition"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-wide text-neutral-400">
                  {p.type}
                </span>

                <div className="flex items-center gap-2">
                  {p.isFree ? (
                    <span className="text-xs rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200">
                      Gratis
                    </span>
                  ) : (
                    <span className="text-xs rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-200">
                      Incluido en pack
                    </span>
                  )}
                </div>
              </div>

              <Link href={`/dashboard/prompts/${p.id}`} className="block">
                <h2 className="mt-3 text-lg font-semibold leading-snug text-neutral-100 group-hover:text-white">
                  {p.title}
                </h2>

                <p className="mt-2 text-sm text-neutral-400 line-clamp-3">
                  {p.description}
                </p>

                {aiBadges.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {aiBadges.map((t) => (
                      <span
                        key={t.slug}
                        className="text-xs rounded-full border border-neutral-800 bg-neutral-950 px-2 py-1 text-neutral-300"
                      >
                        {t.name}
                      </span>
                    ))}
                    {p.aiTools.length > 3 ? (
                      <span className="text-xs rounded-full border border-neutral-800 bg-neutral-950 px-2 py-1 text-neutral-500">
                        +{p.aiTools.length - 3}
                      </span>
                    ) : null}
                  </div>
                )}

                <div className="mt-5">
                  {locked ? (
                    <span className="inline-flex items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-200 transition group-hover:bg-amber-500/20">
                      Ver preview
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition group-hover:opacity-90">
                      Ver prompt completo
                    </span>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {prompts.length === 0 && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 text-neutral-300">
          <div className="text-lg font-semibold">Este pack está vacío</div>
          <p className="mt-2 text-sm text-neutral-400">
            Agrega prompts al pack desde el admin.
          </p>
        </div>
      )}
    </div>
  );
}
