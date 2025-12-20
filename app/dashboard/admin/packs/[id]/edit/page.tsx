// app/dashboard/admin/packs/[id]/edit/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import PackForm from "../../PackForm";
import { updatePackAction } from "../../actions";

export const runtime = "nodejs";

type ActionState =
  | { ok: true; message?: string }
  | { ok: false; message: string };

type PackForEdit = {
  id: string;
  slug: string;
  title: string;
  description: string;
  isFree: boolean;
  priceMx: number;
  isPublished: boolean;
};

export default async function EditPackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const pack = await prisma.pack.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      isFree: true,
      priceMx: true,
      isPublished: true,
    },
  });

  if (!pack) return notFound();

  const safePack = pack as unknown as PackForEdit;

  const action = async (prevState: ActionState, formData: FormData) => {
    "use server";
    return updatePackAction(id, prevState, formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Editar pack</h1>
          <p className="mt-1 text-sm text-neutral-400">{safePack.title}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/admin/packs"
            className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
          >
            ← Volver
          </Link>

          <Link
            href={`/dashboard/packs/${safePack.slug}`}
            className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
          >
            Ver en dashboard
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5">
        <PackForm
          action={action}
          submitLabel="Guardar cambios"
          redirectTo="/dashboard/admin/packs"
          defaultValues={{
            slug: safePack.slug,
            title: safePack.title,
            description: safePack.description,
            isFree: safePack.isFree,
            priceMx: safePack.priceMx,
            isPublished: safePack.isPublished,
          }}
        />
      </div>
    </div>
  );
}
