"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";

export type ActionState =
  | { ok: true; message?: string }
  | { ok: false; message: string };

function getString(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

function friendlyError(e: unknown) {
  const msg = String((e as any)?.message || e);
  if (msg.includes("Unique constraint") || msg.includes("P2002")) {
    return "Ese slug ya existe. Usa otro (ej. 'sora', 'nano-banana').";
  }
  return "No se pudo guardar. Revisa e intenta de nuevo.";
}

export async function createAiToolAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();

    const name = getString(formData, "name");
    const slug = getString(formData, "slug").toLowerCase();

    if (!name) return { ok: false, message: "El nombre es obligatorio." };
    if (!slug) return { ok: false, message: "El slug es obligatorio." };
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return {
        ok: false,
        message:
          "Slug inválido. Usa minúsculas, números y guiones (ej. 'nano-banana').",
      };
    }

    await prisma.aiTool.create({
      data: { name, slug, isActive: true },
    });

    revalidatePath("/dashboard/admin/ai-tools");
    revalidatePath("/dashboard/prompts");
    revalidatePath("/dashboard/admin/prompts");

    return { ok: true, message: "AI agregada." };
  } catch (e) {
    return { ok: false, message: friendlyError(e) };
  }
}

export async function toggleAiToolActiveAction(id: string) {
  await requireAdmin();

  const current = await prisma.aiTool.findUnique({
    where: { id },
    select: { isActive: true },
  });

  await prisma.aiTool.update({
    where: { id },
    data: { isActive: !current?.isActive },
  });

  revalidatePath("/dashboard/admin/ai-tools");
  revalidatePath("/dashboard/prompts");
  revalidatePath("/dashboard/admin/prompts");
}

export async function deleteAiToolAction(id: string) {
  await requireAdmin();

  // OJO: si hay prompts ligados, por tu schema se borrará la relación (PromptAiTool)
  // pero si te falla por constraints, lo ajustamos.
  await prisma.aiTool.delete({ where: { id } });

  revalidatePath("/dashboard/admin/ai-tools");
  revalidatePath("/dashboard/prompts");
  revalidatePath("/dashboard/admin/prompts");
}
