import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import PromptForm from "../../PromptForm";
import { updatePromptAction } from "../../actions";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";

/* ----------------------------------------
   Tipos
---------------------------------------- */
type ActionState =
  | { ok: true; message?: string }
  | { ok: false; message: string };

// Tipado REAL del prompt (evita `any` en build)
async function getPromptForEdit(id: string) {
  return prisma.prompt.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      isFree: true,
      priceMx: true,
      contentPreview: true,
      contentFull: true,
      isPublished: true,
      aiTools: {
        select: {
          aiTool: {
            select: { slug: true },
          },
        },
      },
    },
  });
}

type PromptForEdit = Prisma.PromiseReturnType<typeof getPromptForEdit>;

/* ----------------------------------------
   Page
---------------------------------------- */
export default async function EditPromptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [aiTools, prompt] = await Promise.all([
    prisma.aiTool.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    }),
    getPromptForEdit(id),
  ]);

  if (!prompt) return notFound();

  const action = async (prevState: ActionState, formData: FormData) => {
    "use server";
    return updatePromptAction(id, prevState, formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Editar prompt
          </h1>
          <p className="mt-1 text-sm text-neutral-400">{prompt.title}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/admin/prompts"
            className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
          >
            ← Volver
          </Link>

          <Link
            href={`/dashboard/prompts/${prompt.id}`}
            className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
          >
            Ver en catálogo
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5">
        <PromptForm
          action={action}
          aiTools={aiTools}
          submitLabel="Guardar cambios"
          redirectTo="/dashboard/admin/prompts"
          defaultValues={{
            title: prompt.title,
            description: prompt.description,
            type: prompt.type,
            isFree: prompt.isFree,
            priceMx: prompt.priceMx,
            contentPreview: prompt.contentPreview,
            contentFull: prompt.contentFull,
            isPublished: prompt.isPublished,
            aiSlugs: prompt.aiTools.map((x) => x.aiTool.slug),
          }}
        />
      </div>
    </div>
  );
}
