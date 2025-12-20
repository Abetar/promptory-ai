// app/dashboard/admin/packs/[id]/prompts/actions.ts
"use server";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function togglePromptInPackAction(packId: string, promptId: string) {
  await requireAdmin();

  const existing = await prisma.packPrompt.findUnique({
    where: { packId_promptId: { packId, promptId } },
    select: { packId: true },
  });

  if (existing) {
    await prisma.packPrompt.delete({
      where: { packId_promptId: { packId, promptId } },
    });
  } else {
    await prisma.packPrompt.create({
      data: { packId, promptId },
    });
  }

  revalidatePath(`/dashboard/admin/packs/${packId}/prompts`);
  revalidatePath(`/dashboard/packs`); // listado packs
}
