import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import PromptForm from "../PromptForm";
import { createPromptAction } from "../actions";

export const runtime = "nodejs";

export default async function NewPromptPage() {
  await requireAdmin();

  const aiTools = await prisma.aiTool.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { slug: true, name: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Nuevo prompt
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Crea un prompt y asigna AIs objetivo.
          </p>
        </div>

        <Link
          href="/dashboard/admin/prompts"
          className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
        >
          ← Volver
        </Link>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5">
        <PromptForm
          action={createPromptAction}
          aiTools={aiTools}
          submitLabel="Crear prompt"
        />
      </div>
    </div>
  );
}
