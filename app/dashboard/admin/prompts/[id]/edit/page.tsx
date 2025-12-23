import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import PromptForm from "../../PromptForm";
import { updatePromptAction } from "../../actions";

export const runtime = "nodejs";

type ActionState =
  | { ok: true; message?: string }
  | { ok: false; message: string };

type PromptForEdit = {
  id: string;
  title: string;
  description: string;
  type: "texto" | "imagen" | "video";
  isFree: boolean;
  contentPreview: string;
  contentFull: string;
  isPublished: boolean;
  aiTools: { aiTool: { slug: string } }[];
};

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
    prisma.prompt.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        isFree: true,
        contentPreview: true,
        contentFull: true,
        isPublished: true,
        aiTools: { select: { aiTool: { select: { slug: true } } } },
      },
    }),
  ]);

  if (!prompt) return notFound();

  // ✅ “casts” seguros para evitar any + mantener build feliz
  const safePrompt = prompt as unknown as PromptForEdit;

  const action = async (prevState: ActionState, formData: FormData) => {
    "use server";
    return updatePromptAction(id, prevState, formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Editar prompt</h1>
          <p className="mt-1 text-sm text-neutral-400">{safePrompt.title}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/admin/prompts"
            className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
          >
            ← Volver
          </Link>

          <Link
            href={`/dashboard/prompts/${safePrompt.id}`}
            className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
          >
            Ver en catálogo
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5">
        <PromptForm
          action={action}
          aiTools={aiTools}
          submitLabel="Guardar cambios"
          redirectTo="/dashboard/admin/prompts"
          defaultValues={{
            title: safePrompt.title,
            description: safePrompt.description,
            type: safePrompt.type,
            isFree: safePrompt.isFree,
            contentPreview: safePrompt.contentPreview,
            contentFull: safePrompt.contentFull,
            isPublished: safePrompt.isPublished,
            aiSlugs: safePrompt.aiTools.map((x) => x.aiTool.slug),
          }}
        />
      </div>
    </div>
  );
}
